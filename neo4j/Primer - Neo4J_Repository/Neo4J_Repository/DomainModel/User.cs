using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Neo4J_Repository.DomainModel
{
    public class User
    {
        public String login { get; set; }
        public String name { get; set; }
        public String password { get; set; }
        public List<Rating> ratings { get; set; }
        public List<User> friends { get; set; }
        
        public Rating rate(Movie movie, int stars, String comment)
        {
            return null;
        }
        
        public void befriend(User user)
        {
            
        }
    }
}
