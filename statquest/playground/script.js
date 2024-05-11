const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const htmlContent = `
<ul>
<li><a href="https://youtu.be/tlf6wYJrwKY">A Gentle Introduction to RNA-seq</a></li>
<li><a href="https://youtu.be/nkWGmaYRues">A Gentle Introduction to ChIP-seq</a></li>
<li><a href="https://youtu.be/Wdt6jdi-NQo">edgeR, part1: Library Normalization</a></li>
<li><a href="https://youtu.be/UFB993xufUU">DESeq2, part1: Library Normalization</a></li>
<li><a href="https://youtu.be/Gi0JdrxRq5s">edgeR and DESeq2, part2: Independent Filtering (removing genes with low read counts)</a></li>
<li><a href="https://youtu.be/gKnfP2_Xdpo">RNA-seq – The Problem with Technical Replicates</a></li>
<li><a href="https://youtu.be/TTUrtCY2k-w">RPKM, FPKM, and TPM</a></li>
</ul>

`;


const $ = cheerio.load(htmlContent);
const videos = [];

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

function generateMarkdownFile({ number, title, youtubeId, url, path: videoPath, position, hasChildren, parentPath }) {
    const formattedNumber = number.replace(/(\d+)$/, '$1.');
    const formattedNumberTitle = number.split('.').join('-');
    const safeTitle = title.replace(/"/g, '\\"').replace(/#/g, '\\#');

    const mainFileName = hasChildren ? `${formattedNumberTitle}-0.md` : `${formattedNumberTitle}.md`;
    const directoryPath = hasChildren ? path.join(__dirname, 'docs', videoPath) : path.join(__dirname, 'docs', parentPath || '');
    ensureDirectoryExists(directoryPath);

    let videoContent;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        videoContent = `<BrowserOnly fallback={<div>Loading video...</div>}>
{() => <CustomVideoPlayer videoId="${youtubeId}" />}
</BrowserOnly>`;
    } else {
        videoContent = `### External Resource
<iframe src="${url}" width="100%" height="500px" frameborder="0"></iframe>
[External Link](${url})
`;
    }

    const content = `---
sidebar_position: ${position}
title: "${formattedNumber} ${safeTitle}"
---

import BrowserOnly from '@docusaurus/BrowserOnly';
import CustomVideoPlayer from '@site/src/components/CustomVideoPlayer';

# ${safeTitle}

${videoContent}
`;

    fs.writeFileSync(path.join(directoryPath, mainFileName), content);

    if (hasChildren) {
        const categoryContent = JSON.stringify({
            label: `${formattedNumber} ${title}`,
            position: position,
            link: {
                type: "generated-index"
            }
        }, null, 2);
        fs.writeFileSync(path.join(directoryPath, '_category_.json'), categoryContent);
    }
}



function parseItems(parentSelector, prefix = '', videoPath = '', pos = 1, parentPath = '') {
    $(parentSelector).children('li').each(function (index) {
        const anchor = $(this).find('a').first();
        const title = anchor.text();
        const url = anchor.attr('href');
        const youtubeId = url.split('/').pop().split('?')[0]; // Extract YouTube ID if it's a YouTube link
        const number = prefix + (index + 1);
        const newPath = `${number.split('.').join('-')}`;
        const currentPosition = pos + index;
        const hasChildren = $(this).children('ul').length > 0;
        const currentPath = hasChildren ? path.join(videoPath, newPath) : videoPath;

        videos.push({ number, title, youtubeId, url, path: currentPath, position: currentPosition, hasChildren, parentPath: videoPath });

        if (hasChildren) {
            parseItems($(this).children('ul'), `${number}.`, currentPath, currentPosition + 1, videoPath);
        }
    });
}


parseItems($('ul').first());

videos.forEach(video => generateMarkdownFile(video));