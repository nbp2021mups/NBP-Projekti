using ServiceStack.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;

namespace RedisDataLayer
{
    [DataContract(Name = "Visitor", Namespace = "http://www.nbp.com")]
    public class Visitor
    {
        [DataMember]
        public string IpAddr { get; set; }
        [DataMember]
        public string Agent { get; set; }
        [DataMember]
        public string Referrer { get; set; }

        public Visitor(string ipaddr, string agent, string referrer)
        {
            this.IpAddr = ipaddr;
            this.Agent = agent;
            this.Referrer = referrer;
        }

        public string ToJsonString()
        {
            return JsonSerializer.SerializeToString<Visitor>(this);
        }
    }
}
