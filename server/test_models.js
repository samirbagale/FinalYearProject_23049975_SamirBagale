async function run() {
    const key = 'AIzaSyAH8IUYGSLpUi68BFhpT8nRsJiCt3lqo3I';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(data.models?.map(m => m.name));
}
run();
