using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Neo4J_Repository.DomainModel
{
    public class Rating
    {
        public User user { get; set; }
        public Movie movie { get; set; }
        public int stars { get; set; }
        public String comment { get; set; }
    }
}
