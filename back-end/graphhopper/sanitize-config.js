const fs = require("fs");
const path = "config.yml";
const outPath = "config.yml.clean";
const iconv = require("iconv-lite");
const yaml = require("js-yaml");

function isLikelyText(buf) {
  // check for null bytes
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0) return false;
  }
  return true;
}

try {
  const buf = fs.readFileSync(path);
  console.log("Original size:", buf.length, "bytes");

  // quick stats
  const nullCount = buf.reduce((acc, b) => acc + (b === 0 ? 1 : 0), 0);
  console.log("Null bytes found:", nullCount);

  let decoded;
  // try utf8 first
  try {
    decoded = buf.toString("utf8");
    // throw if replacement char present often
    if (decoded.indexOf("\uFFFD") !== -1) {
      throw new Error("replacement char in utf8");
    }
    console.log("Decoded as UTF-8 initial attempt");
  } catch (e) {
    console.log(
      "UTF-8 decode failed or contained replacement chars, trying windows-1252"
    );
    decoded = iconv.decode(buf, "win1252");
  }

  // remove null bytes and some control characters except newline/tab
  const cleaned = decoded.replace(/\u0000/g, "").replace(/\x0B/g, "");
  fs.writeFileSync(outPath, cleaned, { encoding: "utf8" });
  console.log("Wrote cleaned file to", outPath);

  // test YAML parse
  try {
    const doc = yaml.load(cleaned);
    console.log(
      "YAML parse OK. Top keys:",
      doc && typeof doc === "object"
        ? Object.keys(doc).slice(0, 10).join(", ")
        : "none"
    );
  } catch (err) {
    console.error(
      "YAML parse failed after cleaning:",
      err && err.message ? err.message : err
    );
    console.error(
      "You can inspect",
      outPath,
      "and fix any remaining issues (encoding, binary content)."
    );
    process.exit(2);
  }
} catch (err) {
  console.error(
    "Failed to read or process",
    path,
    ":",
    err && err.message ? err.message : err
  );
  process.exit(1);
}
