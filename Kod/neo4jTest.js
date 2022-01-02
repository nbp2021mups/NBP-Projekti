const neo4j = require('neo4j-driver');

const uri = 'neo4j+s://472b9f78.databases.neo4j.io:7687';
const username = 'neo4j';
const password = '9dZcjmQYUwb0-R9NMztM4k8T0mtdEadIOgSvXZVGo1o';

const testName = 'Stef';

(async() => {
    const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    const session = driver.session();
    try {
        const result = await session.run(
            'CREATE (a:Person {name: $name}) RETURN a', { name: testName }
        );
        console.log("Result", result);
        console.log("Records", result.records);

        const singleRecord = result.records[0];
        console.log("First record", singleRecord);

        const node = singleRecord.get(0);
        console.log("Node", node);

        console.log("Properties", node.properties);
        console.log(node.properties.name);
    } finally {
        await session.close();
    }

    await driver.close();
    return 0;
})();