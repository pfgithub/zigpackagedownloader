import {mkdirSync, readFileSync} from "fs";

process.chdir(process.env.HOME + "/.cache/zig/p");

async function downloadFromZon(zon: string) {
    const file = Bun.file(zon);
    let filetext;
    try {
        filetext = await file.text();
    }catch(e) {
        console.log("skip zon file: "+zon+" for "+e);
        return;
    }
    const fline = filetext.split("\n");
    
    let urlv = null;
    for(const line of fline) {
        if(line.includes('.url = ')) {
            const urltxt = line.match(/".+"/);
            if(urltxt == null) throw new Error("no urltxt");
            const urlparsed = JSON.parse(urltxt[0]);
            if(urlv != null) throw new Error("previous url had no hash");
            urlv = urlparsed;
        }else if(line.includes('.hash = ')) {
            const urltxt = line.match(/".+"/);
            if(urltxt == null) throw new Error("no hashtxt");
            const hashparsed = JSON.parse(urltxt[0]);
            if(urlv == null) throw new Error(".hash field above .url field");

            await exec(["fish", __dirname + "/dnlpkg.fish", urlv, hashparsed]);
            urlv = null;

            await downloadFromZon(hashparsed + "/build.zig.zon");
        }
    }
    if(urlv != null) throw new Error("missed url: " + urlv);
}

await downloadFromZon(Bun.argv[2]);



async function exec(cmd) {
    const res = Bun.spawnSync(cmd, {stdio: ["inherit", "pipe", "inherit"]});
    if(res.exitCode !== 0) {
        console.log(cmd, res);
        process.exit(1);
    }
    return new TextDecoder().decode(res.stdout);
}
