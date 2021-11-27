using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using Neo4J_Repository.DomainModel;
using Neo4jClient;
using Neo4jClient.Cypher;

namespace Neo4J_Repository
{
    public partial class Form1 : Form
    {

        private GraphClient client;

        //relationships:RATED, ACTS_IN, FRIEND, DIRECTED

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            client = new GraphClient(new Uri("http://localhost:7474/db/data"), "neo4j", "edukacija");
            try
            {
                client.Connect();
            }
            catch(Exception exc)
            {
                MessageBox.Show(exc.Message);
            }

            //User user = client.Get<User>(1).Data;

            //var query = new Neo4jClient.Cypher.CypherQuery("start n=node:User(name:Micha) match n-[r:FRIEND*]->friend return friend", 
            //                                                new Dictionary<string, object>(), CypherResultMode.Set);

            //var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) match n-[r:FRIEND]->friend return friend",
            //                                                new Dictionary<string, object>(), CypherResultMode.Set);

            //var nodes = client.RootNode.StartCypher("*").Match("[:FRIEND]->friend").Return<Node<User>>("friend");

            //pretraga glumaca po imenu
            //start n=node(*) where has(n.__type__) and n.__type__ =~ ".*Actor" and has(n.name) and n.name =~ "Mi.*" return n
            
            //svi glumci
            //start n=node(*) match n-[r:ACTS_IN]->movie where has(n.__type__) and n.__type__ =~ ".*Actor" return movie
            
            //svi glumci u filmu Avatar
            //start n=node(*) match n<-[r:ACTS_IN]-a where has(n.title) and n.title =~ "Avatar" return a

            //svi filmovi koje je rezirao Steven Spielberg
            //start n=node(*) match n-[r:DIRECTED]->m where has(n.name) and n.name =~ ".*Steven Spielberg.*" return m

            //svi glumci koji glume u filmovima koje je rezirao Steven Spielberg
            //start n=node(*) match n-[r:DIRECTED]->m<-[r1:ACTS_IN]-a where has(n.name) and n.name =~ ".*Steven Spielberg.*" return a

            //List<User> users = ((IRawGraphClient) client).ExecuteGetCypherResults<User>(query).ToList();

            //foreach (User u in users)
            //{
            //    MessageBox.Show(u.name);
            //}
            
        }

        
        private void button1_Click(object sender, EventArgs e)
        {
            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) match (n)-[r:FRIEND]->(friend) return friend",
                                                           new Dictionary<string, object>(), CypherResultMode.Set);

            List<User> users = ((IRawGraphClient)client).ExecuteGetCypherResults<User>(query).ToList();

            foreach (User u in users)
            {
                MessageBox.Show(u.name);
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            //start n=node(*) where (n:Actor) and has(n.name) and n.name =~ ".*Nina*." return n
            string actorName = ".*" + actorNameTextBox.Text + ".*";

            Dictionary<string, object> queryDict = new Dictionary<string, object>();
            queryDict.Add("actorName", actorName);

            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) where (n:Actor) and exists(n.name) and n.name =~ {actorName} return n",
                                                            queryDict, CypherResultMode.Set);

            List<Actor> actors = ((IRawGraphClient)client).ExecuteGetCypherResults<Actor>(query).ToList();

            foreach (Actor a in actors)
            {
                //DateTime bday = a.getBirthday();
                MessageBox.Show(a.name);
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {
            string movieName = ".*" + movieNameTextBox.Text + ".*";

            Dictionary<string, object> queryDict = new Dictionary<string, object>();
            queryDict.Add("movieName", movieName);

            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) match (n)<-[r:ACTS_IN]-(a) where exists(n.title) and n.title =~ {movieName} return a",
                                                            queryDict, CypherResultMode.Set);

            List<Actor> actors = ((IRawGraphClient)client).ExecuteGetCypherResults<Actor>(query).ToList();

            foreach (Actor a in actors)
            {
                //DateTime bday = a.getBirthday();
                MessageBox.Show(a.name);
            }
        }

        private void button4_Click(object sender, EventArgs e)
        {
            string directorName = ".*" + directorTextBox.Text + ".*";

            Dictionary<string, object> queryDict = new Dictionary<string, object>();
            queryDict.Add("directorName", directorName);

            

            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) match (n)-[r:DIRECTED]->(m) where exists(n.name) and n.name =~ {directorName} return m",
                                                            queryDict, CypherResultMode.Set);

            List<Movie> movies = ((IRawGraphClient)client).ExecuteGetCypherResults<Movie>(query).ToList();

            foreach (Movie m in movies)
            {
                MessageBox.Show(m.title);
            }
        }

        private void button5_Click(object sender, EventArgs e)
        {
            string directorName = ".*" + directorActorsTextBox.Text + ".*";

            Dictionary<string, object> queryDict = new Dictionary<string, object>();
            queryDict.Add("directorName", directorName);



            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) match (n)-[r:DIRECTED]->(m)<-[r1:ACTS_IN]-(a) where exists(n.name) and n.name =~ {directorName} return a",
                                                            queryDict, CypherResultMode.Set);

            List<Actor> actors = ((IRawGraphClient)client).ExecuteGetCypherResults<Actor>(query).ToList();

            foreach (Actor a in actors)
            {
                MessageBox.Show(a.name);
            }
        }

        private void button6_Click(object sender, EventArgs e)
        {
            AddActor addActorForm = new AddActor();
            addActorForm.client = client;
            addActorForm.ShowDialog();
        }

        private void button7_Click(object sender, EventArgs e)
        {
            
            string actorName = ".*student.*";
            
            Dictionary<string, object> queryDict = new Dictionary<string, object>();
            queryDict.Add("actorName", actorName);

            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) where (n:Actor) and exists(n.name) and n.name =~ {actorName} delete n",
                                                            queryDict, CypherResultMode.Projection);

            List<Actor> actors = ((IRawGraphClient)client).ExecuteGetCypherResults<Actor>(query).ToList();

            foreach (Actor a in actors)
            {
                MessageBox.Show(a.name);
            }
        }

        private void button8_Click(object sender, EventArgs e)
        {
            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) where (n:Actor) and has(n.name) and n.name =~ \".*student.*\" set n.biography = 'mnogo dobar student' return n",
                                                            new Dictionary<string, object>(), CypherResultMode.Set);

            List<Actor> actors = ((IRawGraphClient)client).ExecuteGetCypherResults<Actor>(query).ToList();

            foreach (Actor a in actors)
            {
                MessageBox.Show(a.biography);
            }
        }
    }
}
