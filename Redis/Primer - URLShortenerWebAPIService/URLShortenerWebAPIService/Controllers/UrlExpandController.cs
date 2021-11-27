using RedisDataLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace URLShortenerWebAPIService.Controllers
{
    public class UrlExpandController : ApiController
    {
        
        // GET api/urlexpand?url=https://google.com
        public HttpResponseMessage Get(string url)
        {
            string longUrl = string.Empty;

            URLShortener shortener = new URLShortener();
            string urlHash = shortener.GetUrlHashFromShortenedUrl(url);
            if(urlHash != string.Empty)
                longUrl = shortener.Expand(urlHash);
            
            var response = Request.CreateResponse(HttpStatusCode.Moved);
            response.Headers.Location = new Uri(longUrl);
            return response;

        }

    }
}
