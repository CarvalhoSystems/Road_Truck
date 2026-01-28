const fs = require("fs");
const yaml = require("js-yaml");
const iconv = require("iconv-lite");

const path = "config.yml";
try {
  const buf = fs.readFileSync(path);
  let str;

  // Detect BOM / UTF-16
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    str = iconv.decode(buf, "utf16le");
  } else if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    str = iconv.decode(buf, "utf16be");
  } else {
    // try utf8 first, fallback to windows-1252
    try {
      str = buf.toString("utf8");
      // quick parse attempt to see if utf8 is valid
      yaml.load(str);
    } catch (e) {
      str = iconv.decode(buf, "win1252");
    }
  }

  const doc = yaml.load(str);
  console.log("YAML OK — arquivo parseado com sucesso.");
  // opcional: imprimir parte da config
  if (doc && typeof doc === "object") {
    console.log(
      "Exemplo de chaves encontradas:",
      Object.keys(doc).slice(0, 10).join(", ")
    );
  }
} catch (err) {
  console.error(
    "Falha ao parsear config.yml:",
    err && err.message ? err.message : err
  );
  process.exit(1);
}
