using ServiceStack.Redis;
using ServiceStack.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RedisDataLayer
{
    public class URLShortener
    {
        private string globalCounterKey = "next.url.id";

        readonly RedisClient redis = new RedisClient(Config.SingleHost);

        public URLShortener()
        {
            if (!CheckNextUrlGlobalCounterExists())
            {
                var redisCounterSetup = redis.As<string>();
                redisCounterSetup.SetEntry(globalCounterKey, "1");
            }
        }

        public bool CheckNextUrlGlobalCounterExists()
        {
            var test = redis.Get<object>(globalCounterKey);
            return (test != null) ? true : false;
        }

        public string GetNextUrlId()
        {
            long nextCounterKey = redis.Incr(globalCounterKey);
            return nextCounterKey.ToString("x");
        }

        public string ShortenUrl(string longUrl)
        {
            //create url hash - new key for longUrl
            string hashNum = this.GetNextUrlId();
            string urlHash = "url:" + hashNum + ":id";
            //add new entry for long Url
            redis.Set<string>(urlHash, longUrl);
            //push new short url in global list of urls
            redis.PushItemToList("global:urls", urlHash);

            return hashNum;
        }

        public string Expand(string urlHash)
        {
            string longUrl = string.Empty;

            string urlKey = "url:" + urlHash + ":id";
            longUrl = redis.Get<string>(urlKey);
            
            return longUrl;
        }

        public long Visit(string urlHash, string ipAddr, string agent, string referrer)
        {
            //create an object of Visitor types
            Visitor visitor = new Visitor(ipAddr, agent, referrer);

            //push the visitor object in the visitor list of this short URL
            redis.PushItemToList("visitors:" + urlHash + ":url", visitor.ToJsonString());

            //increments the clicks of the short url
            return redis.Incr("clicks:" + urlHash + ":url");
        }
        
        public long GetClicks(string urlHash)
        {
            return redis.Get<long>("clicks:" + urlHash + ":url");
        }

        public List<Visitor> RecentVisitors(string urlHash)
        {
            List<Visitor> recentVisitors = new List<Visitor>();

            foreach(string jsonVisitorString in redis.GetRangeFromList("visitors:" + urlHash + ":url", 0, 100))
            {
                Visitor v = (Visitor)JsonSerializer.DeserializeFromString(jsonVisitorString, typeof(Visitor));
                recentVisitors.Add(v);
            }

            return recentVisitors;
        }

        public string GetUrlHashFromShortenedUrl(string shortenedUrl)
        {
            string urlHash = string.Empty;

            string[] urlParts = shortenedUrl.Split('/');
            if (urlParts.Length > 0)
            {
                urlHash = urlParts[urlParts.Length - 1];
            }

            return urlHash;
        }
    }
}
