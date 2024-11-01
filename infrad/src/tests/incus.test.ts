import IncusSocketAPI from "../lib/incus.js";

const incus = new IncusSocketAPI();

const main = async () => {
    const response = await incus.createContainer("images:ubuntu/22.04", "ubuntu-locci");
    console.log({ response })
}

main();

