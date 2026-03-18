async function run() {
  const res = await fetch('https://staticmcp.com');
  const text = await res.text();
  console.log(text);
}
run();
