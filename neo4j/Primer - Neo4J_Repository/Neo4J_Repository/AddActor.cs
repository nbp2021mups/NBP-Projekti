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
    public partial class AddActor : Form
    {
        public GraphClient client;
        public AddActor()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {

            Actor actor = this.createActor();
            string maxId = getMaxId();

            try
            {
                int mId = Int32.Parse(maxId);
                actor.id = (mId++).ToString();
            }
            catch (Exception exception)
            {
                actor.id = "";
            }


            Dictionary<string, object> queryDict = new Dictionary<string, object>();
            queryDict.Add("name", actor.name);
            queryDict.Add("birthday", actor.birthday);
            queryDict.Add("birthplace", actor.birthplace);
            queryDict.Add("biography", actor.biography);
            
            var query = new Neo4jClient.Cypher.CypherQuery("CREATE (n:Actor {id:'" + actor.id + "', name:'" + actor.name 
                                                            + "', birthday:'" + actor.birthday + "', birthplace:'" + actor.birthplace 
                                                            + "', biography:'" + actor.biography 
                                                            + "'}) return n",
                                                            queryDict, CypherResultMode.Set);

            List<Actor> actors = ((IRawGraphClient)client).ExecuteGetCypherResults<Actor>(query).ToList();

            foreach (Actor a in actors)
            {
                MessageBox.Show(a.name);
            }

            //NodeReference<Actor> newActor = client.Create(actor);

            this.Close();
        }

        

        private Actor createActor()
        {
            Actor a = new Actor();

            TimeSpan unixtime =
                dateTimePicker1.Value.ToUniversalTime() - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            a.birthday = unixtime.TotalMilliseconds.ToString();
            a.birthplace = birthplaceTextBox.Text;
            a.filmography = new List<Movie>();
            a.name = nameTextBox.Text;
            
            return a;
        }

        private String getMaxId()
        {
            var query = new Neo4jClient.Cypher.CypherQuery("start n=node(*) where exists(n.id) return max(n.id)",
                                                            new Dictionary<string, object>(), CypherResultMode.Set);

            String maxId = ((IRawGraphClient)client).ExecuteGetCypherResults<String>(query).ToList().FirstOrDefault();

            return maxId;
        }
    }
}
