document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

function getPageNumber(params) {
    return parseInt(params.get('page')) || 1;
}

function renderVideoList(videos, page, videosPerPage, baseUrl) {
    const start = (page - 1) * videosPerPage;
    const end = start + videosPerPage;
    const paginatedVideos = videos.slice(start, end);
    const videoList = paginatedVideos.map(video => `
        <div class="relative bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <a href="index.html?type=video&path=${video.video_page}">
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-[290px] object-cover">
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">${video.views}</div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-white">${video.title}</h3>
                </div>
            </a>
        </div>
    `).join('');
    const totalPages = Math.ceil(videos.length / videosPerPage);
    const pagination = totalPages > 1 ? Array.from({ length: totalPages }, (_, i) => {
        const pageNum = i + 1;
        return pageNum === page
            ? `<button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">${pageNum}</button>`
            : `<a href="${baseUrl}&page=${pageNum}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">${pageNum}</a>`;
    }).join('') : '';
    return { videoList, pagination };
}

fetch('videos.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch videos.json');
        return response.json();
    })
    .then(data => {
        const params = getUrlParams();
        const type = params.get('type') || 'home';
        const pageTitle = document.getElementById('page-title');
        const contentArea = document.getElementById('content-area');
        const paginationArea = document.getElementById('pagination');
        const hashtagList = document.getElementById('hashtag-list');
        const categoryList = document.getElementById('category-list');
        const sortedVideos = data.videos.sort((a, b) => b.id - a.id);

        // Render categories
        categoryList.innerHTML = '';
        const uniqueCategories = [...new Set(data.videos.map(video => video.category))];
        uniqueCategories.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = `index.html?type=category&name=${category.toLowerCase()}`;
            categoryLink.className = 'text-blue-400 hover:underline mr-4';
            categoryLink.textContent = category;
            categoryList.appendChild(categoryLink);
        });

        // Render hashtags
        hashtagList.innerHTML = '';
        const uniqueHashtags = [...new Set(data.videos.flatMap(video => video.hashtags))];
        uniqueHashtags.forEach(hashtag => {
            const hashtagLink = document.createElement('a');
            hashtagLink.href = `index.html?type=hashtag&name=${hashtag}`;
            hashtagLink.className = 'text-blue-400 hover:underline mr-4';
            hashtagLink.textContent = `#${hashtag}`;
            hashtagList.appendChild(hashtagLink);
        });

        // Handle different page types
        if (type === 'home') {
            document.title = 'Exclusiveclips';
            pageTitle.textContent = 'Featured Videos';
            const videosPerPage = 10;
            const page = getPageNumber(params);
            const { videoList, pagination } = renderVideoList(sortedVideos, page, videosPerPage, 'index.html');
            contentArea.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${videoList}</div>`;
            paginationArea.innerHTML = pagination;
        } else if (type === 'category' && params.get('name')) {
            const category = params.get('name').toLowerCase();
            const categoryVideos = sortedVideos.filter(video => video.category.toLowerCase() === category);
            document.title = `${category.charAt(0).toUpperCase() + category.slice(1)} - Exclusiveclips`;
            pageTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Videos`;
            const videosPerPage = 10;
            const page = getPageNumber(params);
            const { videoList, pagination } = renderVideoList(categoryVideos, page, videosPerPage, `index.html?type=category&name=${category}`);
            contentArea.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${videoList}</div>`;
            paginationArea.innerHTML = pagination;
            if (categoryVideos.length === 0) {
                contentArea.innerHTML = '<p class="text-red-500">No videos found for this category.</p>';
            }
        } else if (type === 'hashtag' && params.get('name')) {
            const hashtag = params.get('name');
            document.title = `#${hashtag} - Exclusiveclips`;
            pageTitle.textContent = `#${hashtag} Videos`;
            const hashtagVideos = sortedVideos.filter(video => video.hashtags.includes(hashtag));
            contentArea.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${hashtagVideos.map(video => `
                <div class="relative bg-gray-900 rounded-lg shadow-md overflow-hidden">
                    <a href="index.html?type=video&path=${video.video_page}">
                        <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-[290px] object-cover">
                        <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">${video.views}</div>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-white">${video.title}</h3>
                        </div>
                    </a>
                </div>
            `).join('')}</div>`;
            if (hashtagVideos.length === 0) {
                contentArea.innerHTML = '<p class="text-red-500">No videos found for this hashtag.</p>';
            }
            paginationArea.innerHTML = '';
        } else if (type === 'video' && params.get('path')) {
            const videoPath = params.get('path');
            const video = sortedVideos.find(v => v.video_page === videoPath);
            if (!video) {
                contentArea.innerHTML = '<p class="text-red-500">Video not found.</p>';
                return;
            }
            document.title = `${video.title} - Exclusiveclips`;
            pageTitle.textContent = video.title;
            contentArea.innerHTML = `
                <div class="p-4 text-white text-center">
                    <p>This video is uploaded on the <i class="fab fa-telegram-plane"></i> <a href="https://t.me/Exclusiveclips4" class="text-blue-400 hover:underline">@exclusiveclips4</a></p>
                </div>
                <div class="relative bg-gray-900 rounded-lg shadow-md overflow-hidden">
                    <video controls class="w-full">
                        <source src="${video.video_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="p-4">
                        <p class="text-lg text-white">Views: ${video.views}</p>
                        <p class="text-lg text-white">Category: <a href="index.html?type=category&name=${video.category.toLowerCase()}" class="text-blue-400 hover:underline">${video.category}</a></p>
                        <p class="text-lg text-white">Hashtags: ${video.hashtags.map(tag => `<a href="index.html?type=hashtag&name=${tag}" class="text-blue-400 hover:underline">#${tag}</a>`).join(' ')}</p>
                    </div>
                </div>
                <div class="mt-6 text-center">
                    <a href="https://t.me/Exclusiveclis" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Show More</a>
                </div>
            `;
            paginationArea.innerHTML = '';
        } else {
            contentArea.innerHTML = '<p class="text-red-500">Invalid page.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading videos:', error);
        document.getElementById('content-area').innerHTML = '<p class="text-red-500">Error loading videos. Please try again later.</p>';
    });
