const fs = require("node:fs")
const path = require("node:path")

module.exports = (eleventyConfig) => 
{
    eleventyConfig.addPassthroughCopy({ "static/css": "css" })
    eleventyConfig.addPassthroughCopy({ "static/favicon.ico": "favicon.ico" })
    eleventyConfig.addPassthroughCopy({ "static/js": "js" })
    
    eleventyConfig.addPassthroughCopy({ "node_modules/@toast-ui/editor/dist/toastui-editor.css": "css/toastui-editor.css" })
    eleventyConfig.addPassthroughCopy({ "node_modules/@toast-ui/editor/dist/theme/toastui-editor-dark.css": "css/toastui-editor-dark.css" })

    for (const author of fs.readdirSync("content/authors", { withFileTypes: true }).filter(entry => entry.isDirectory()))
    {
        const authorPath = path.join("content/authors", author.name)
        
        for (const slug of fs.readdirSync(authorPath, { withFileTypes: true }).filter(entry => entry.isDirectory()))
        {
            const attachments = path.join(authorPath, slug.name, "attachment")
        
            if (fs.existsSync(attachments)) eleventyConfig.addPassthroughCopy({ [attachments]: `~${author.name}/${slug.name}/attachment` })
        }
    }

    
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
