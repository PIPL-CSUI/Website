module.exports = {
    tags: "author_posts",
  
    eleventyComputed: {
        authorName: (data) => 
        {
            const stem  = data.page.filePathStem
            const parts = stem.split("/")
  
            return parts[2]
        }
    },
    
    permalink: (data) => 
    {
        const stem    = data.page.filePathStem
        const newPath = stem.replace(/^\/authors\//, "")
        
        return `/~${newPath}/index.html`
    }
}
