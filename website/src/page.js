import Collection from './collection'
import globby from 'globby';
import fs from 'fs-extra';
import path from 'path';

let allPages = null;

async function loadAllPages() {

    const docsDir = path.resolve(__dirname, '..', 'docs');
    console.log('Loading all pages from path', docsDir);
    
    return []; 
}

export function getPageList(baseUrl) {
    if(!allPages) {
        allPages = loadAllPages();
    }
    return new Collection([]);
}

export default getPageList;