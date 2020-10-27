const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');

// consts
const salt = 'saltiest';
const iv = 'the iv: 16 bytes';

// main
const wxmd = async (wxid, pkgsrc, pkgdst) => {
    try {
        const buf = await fs.readFile(pkgsrc);
        const bufHead = buf.slice(6, 1024 + 6);
        const bufTail = buf.slice(1024 + 6);
        
        // handle head part
        const dk = await new Promise((resolve, reject) => {
            crypto.pbkdf2(wxid, salt, 1000, 32, 'sha1', (err, dk) => {
                if (err) {
                    reject(err);
                }
                resolve(dk);
            })
        })
        const decipher = crypto.createDecipheriv('aes-256-cbc', dk, iv);
        const originalHead = Buffer.alloc(1024, decipher.update(bufHead));

        // handle tail part
        const xorKey = wxid.length < 2 ? 0x66 : wxid.charCodeAt(wxid.length - 2);
        const tail = [];
        for(let i = 0; i < bufTail.length; ++i){
            tail.push(xorKey ^ bufTail[i]);
        }
        const originalTail = Buffer.from(tail);
        
        // write to file
        pkgdst = pkgdst || '.'
        const fstate = await fs.lstat(pkgdst);
        if(fstate.isDirectory()){
            pkgdst = path.join(pkgdst, `/decrypt_${wxid}.wxapkg`);
        }
        await fs.writeFile(pkgdst, Buffer.concat([originalHead, originalTail]), 'binary');
        console.log(chalk.green('解码完成'))

    } catch (err) {
        console.log(chalk.red(`错误: ${err}`));
    }
}

program
    .command('decry <wxid> <src> [dst]')
    .description('解码PC端微信小程序包')
    .action((wxid, src, dst) => {
        wxmd(wxid, src, dst);
    })

program.version('1.0.0')
    .usage("decry <wxid> <src> [dst]")
    .parse(process.argv);
