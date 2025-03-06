const fs = require('node:fs');
const path = require('path');
async function setTheme() {
    /* Get the current theme */
    const theme = await eagle.app.theme;
    document.body.setAttribute('theme', theme);
}
function saveDataToFile(filePath, data) {
    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error('could not save file err=', err);
        } else {
            //console.log('save');
        }
    });
}
function createButtonWithCallback(label, callback, options = {}) {
    const { parameters = [], parent = document.body, context = null } = options;
    const button = document.createElement('button');
    // Use arrow function to preserve 'this' or bind context
    const wrappedCallback = () => {
        try {
            callback.apply(context, parameters);
        } catch (error) {
            console.error('Error in button callback:', error);
            // Optionally: Display an error message to the user, log to a server, etc.
        }
    };
    button.addEventListener('click', wrappedCallback);
    button.innerText = label;
    parent.appendChild(button);
    return button; // Optionally return the created button
}
async function showDirectoryPickerDialog() {
    const options = {
        title: 'Select a Directory',
        properties: ['openDirectory'],
    };
    try {
        const result = await eagle.dialog.showOpenDialog(options);
        if (!result.canceled) {
            return result.filePaths[0]; // Return the selected directory path
        } else {
            return null; // Return null if cancelled
        }
    } catch (err) {
        console.error('Error selecting directory:', err);
        return null; // Return null on error
    }
}
async function SaveTags(format) {
    /** @param {string[]} tags */
    function format_tags(tags) {
        if (format === 'csv') {
            return tags.join(', ');
        } else if (format === 'txt') {
            return tags.join('\n');
        }
    }
    const selectedItems = await eagle.item.getSelected();
    const itemsLen = selectedItems.length;
    if (itemsLen === 0) {
        alert('no items selected?');
        return;
    }
    if (itemsLen > 1 && !confirm(`save ${itemsLen} items?`)) {
        return;
    }
    if (itemsLen >= 100 && !confirm(`many items (${itemsLen}) selected, are you sure?`)) {
        return;
    }
    if (itemsLen >= 1000 && !confirm('really?')) {
        return;
    }
    const saveDir = await showDirectoryPickerDialog();
    selectedItems.forEach((item) => {
        if (item.tags.length === 0) {
            console.warn(`no tags on item; skipping...`, item);
            return;
        }
        //const save_filename = item.name + '.tags.' + format;
        const save_filename = item.name + '.txt';
        const pth = path.join(saveDir, save_filename);
        // const tags = item.tags.join('\n');
        saveDataToFile(pth, format_tags(item.tags));
    });
}
eagle.onPluginCreate(async () => {
    await setTheme();
    (() => {
        createButtonWithCallback('save tags', SaveTags, {
            parameters: ['csv'],
        });
    })();
});
