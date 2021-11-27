using RedisDataLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace URLShortenerWebAPIService.Controllers
{
    public class VisitorController : ApiController
    {
        // GET api/visitor?url=https://google.com
        public IEnumerable<Visitor> Get(string url)
        {
            List<Visitor> visitors = new List<Visitor>();

            URLShortener shortener = new URLShortener();
            string urlHash = shortener.GetUrlHashFromShortenedUrl(url);
            
            visitors = shortener.RecentVisitors(urlHash);

            return visitors;
        }

        // GET api/visitor/?url=https://google.com&ipaddr=10.10.45.45&agent=Mozilla&referrer=test
        public long Get(string url, string ipaddr, string agent, string referrer)
        {
            long numVisits = 0;
            URLShortener shortener = new URLShortener();
            
            string urlHash = shortener.GetUrlHashFromShortenedUrl(url);
            if(urlHash != string.Empty)
                numVisits = shortener.Visit(urlHash, ipaddr, agent, referrer);
            
            return numVisits;
        }

        
    }
}
