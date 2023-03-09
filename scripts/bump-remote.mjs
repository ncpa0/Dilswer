import crypto from "crypto";

const getRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex");
};

const getEnv = (key) => {
  const variable = process.env[key];

  if (!variable) {
    throw new Error(`Env var ${key} is not set.`);
  }

  return variable;
};

export function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    getEnv("GH_BOT_ENCRYPTION_SECRET"),
    null
  );
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

async function main() {
  try {
    const version = process.argv[2];
    const accessToken = getEnv("GH_BOT_AUTH_TOKEN");
    const apiUrl = getEnv("GH_BOT_API_URL");

    if (!version) {
      throw new Error("Version argument must be specified");
    }

    const data = encrypt(
      JSON.stringify({
        authToken: accessToken,
        repositoryOwner: "ncpa0",
        repositoryName: "Dilswer",
        branchName: "master",
        irrelevantGibberish: getRandomString(32),
      })
    );

    await fetch(`${apiUrl}/bump-version`, {
      method: "POST",
      body: JSON.stringify({
        data,
      }),
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
