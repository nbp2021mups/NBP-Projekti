using RedisDataLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace URLShortenerWebAPIService.Controllers
{
    public class UrlShortenController : ApiController
    {
       
        // GET api/urlshorten/5
        public string Get(string url)
        {
            URLShortener shortener = new URLShortener();
            string shortUrl = shortener.ShortenUrl(url);
            return "http://nbp.com/" + shortUrl;
        }

    }
}
