const neo4j = require('neo4j-driver');

const uri = 'neo4j+s://472b9f78.databases.neo4j.io:7687';
const username = 'neo4j';
const password = '9dZcjmQYUwb0-R9NMztM4k8T0mtdEadIOgSvXZVGo1o';

let driver=null;

const getConnection = () => {
    if (driver) 
        return driver
   
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    return driver
}

driver=getConnection();
  
module.exports=driver;