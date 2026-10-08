module.exports = function(eleventyConfig) 
{
    eleventyConfig.addPassthroughCopy({ "css": "css" })

    
    eleventyConfig.addFilter("readableDate", (dateObj) => 
    {
        return dateObj.toLocaleDateString();
    })

    eleventyConfig.addCollection("authors", (collectionApi) =>
    {
        let authors = new Set();
    
        collectionApi.getFilteredByTag("author_posts").forEach((item) => 
        {
            if (item.data.authorName) authors.add(item.data.authorName)
        })
        
        return Array.from(authors)
    })

    return {
        dir: {
            input: "content",
            includes: "_includes",
            output: "_site"
        }
    };
}
