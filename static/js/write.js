const attachments = [];
let attachmentNumber = 0;
const titleInput = document.querySelector("#title");
const dateInput = document.querySelector("#date");
const tagsInput = document.querySelector("#tags");
const status = document.querySelector("#draft-status");

function today() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function openDraftDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("pipl-writing", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("drafts");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function readDraft(database) {
    return new Promise((resolve, reject) => {
        const request = database.transaction("drafts").objectStore("drafts").get("current");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function saveDraft(database, draft) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction("drafts", "readwrite");
        transaction.objectStore("drafts").put(draft, "current");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
    });
}

async function start() {
    let database;
    let savedDraft;
    try {
        database = await openDraftDatabase();
        savedDraft = await readDraft(database);
    } catch (error) {
        console.error("Could not load the local draft", error);
        database = undefined;
        status.textContent = "Draft autosave is unavailable in this browser.";
    }

    titleInput.value = savedDraft?.title || "";
    dateInput.value = savedDraft?.date || today();
    tagsInput.value = savedDraft?.tags?.join(", ") || "";
    let initialValue = savedDraft?.markdown || "";
    for (const item of savedDraft?.attachments || []) {
        try {
            const url = await blobToDataUrl(item.blob);
            attachments.push({ ...item, url });
            attachmentNumber++;
        } catch (error) {
            console.error("Could not restore a draft image", error);
            status.textContent = "An image could not be restored; the rest of the draft is available.";
        }
    }

    const editor = new toastui.Editor({
        el: document.querySelector("#editor"),
        height: "500px",
        initialEditType: "markdown",
        previewStyle: "vertical",
        theme: "dark",
        initialValue,
        customHTMLRenderer: {
            image(node, context, convertors) {
                const token = context.origin
                    ? context.origin()
                    : convertors.image(node, context, convertors);
                const attachment = attachments.find((item) => item.path === node.destination);
                if (attachment && !Array.isArray(token)) token.attributes.src = attachment.url;
                return token;
            },
        },
        hooks: {
            addImageBlobHook(blob, callback) {
                const extension = blob.name?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
                    || blob.type.split("/")[1]?.replace("jpeg", "jpg").replace(/[^a-z0-9]/gi, "")
                    || "bin";
                const path = `attachment/image${++attachmentNumber}.${extension}`;
                blobToDataUrl(blob).then((url) => {
                    attachments.push({ blob, path, url });
                    callback(path, blob.name || "");
                }).catch(() => alert("Could not load that image into the editor."));
            },
        },
    });

    function getDraft() {
        let markdown = editor.getMarkdown();
        const usedAttachments = [];
        for (const { blob, path } of attachments) {
            if (!markdown.includes(path)) continue;
            const extension = path.split(".").pop();
            const outputPath = `attachment/image${usedAttachments.length + 1}.${extension}`;
            markdown = markdown.replaceAll(path, outputPath);
            usedAttachments.push({ blob, path: outputPath });
        }
        return {
            title: titleInput.value,
            date: dateInput.value || today(),
            tags: [...new Set(tagsInput.value.split(",").map((tag) => tag.trim()).filter(Boolean))],
            markdown,
            attachments: usedAttachments,
        };
    }

    function articleMarkdown(draft) {
        const tags = [...new Set(["author_posts", ...draft.tags])];
        return [
            "---",
            "layout: layout.njk",
            `title: ${JSON.stringify(draft.title.trim() || "Untitled article")}`,
            `date: ${draft.date}`,
            `tags: ${JSON.stringify(tags)}`,
            "---",
            "",
            draft.markdown,
        ].join("\n");
    }

    let saveTimer;
    function scheduleSave() {
        if (!database) return;
        clearTimeout(saveTimer);
        status.textContent = "Saving draft…";
        saveTimer = setTimeout(async () => {
            try {
                await saveDraft(database, getDraft());
                status.textContent = "Draft saved on this device.";
            } catch (error) {
                console.error("Could not save the local draft", error);
                status.textContent = "Could not save draft. Export a ZIP to keep a copy.";
            }
        }, 500);
    }

    editor.on("change", scheduleSave);
    for (const input of [titleInput, dateInput, tagsInput]) input.addEventListener("input", scheduleSave);

    document.querySelector("#export").addEventListener("click", async (event) => {
        if (!dateInput.reportValidity()) return;
        const title = titleInput.value.trim() || "Untitled article";
        const button = event.currentTarget;
        button.disabled = true;
        try {
            const draft = getDraft();
            const zip = new JSZip();
            zip.file("page.md", articleMarkdown(draft));
            if (draft.attachments.length) {
                const folder = zip.folder("attachment");
                for (const { blob, path } of draft.attachments) {
                    folder.file(path.split("/").pop(), blob);
                }
            }
            const link = document.createElement("a");
            link.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
            link.download = `${title}.zip`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 0);
        } catch (error) {
            console.error("Article export failed", error);
            alert("Could not export the article ZIP. Your content is still in the editor.");
        } finally {
            button.disabled = false;
        }
    });

    if (database) status.textContent = "Draft autosave is on for this device.";
}

start();
