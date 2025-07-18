document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

function getPageNumber(params) {
    const page = parseInt(params.get('page')) || 1;
    return page < 1 ? 1 : page;
}

function renderVideoList(videos, page, videosPerPage, baseUrl) {
    const totalVideos = videos.length;
    const totalPages = Math.ceil(totalVideos / videosPerPage);
    const validPage = Math.min(Math.max(page, 1), totalPages || 1);
    const start = (validPage - 1) * videosPerPage;
    const end = start + videosPerPage;
    const paginatedVideos = videos.slice(start, end);
    const videoList = paginatedVideos.length ? paginatedVideos.map(video => `
        <div class="relative bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <a href="index.html?type=video&path=${video.video_page}">
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-[290px] object-cover" onerror="this.src='https://via.placeholder.com/400x225?text=Thumbnail+Not+Found';">
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">${video.views}</div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-white">${video.title}</h3>
                </div>
            </a>
        </div>
    `).join('') : '<p class="text-red-500">No videos available for this page.</p>';
    const pagination = totalPages > 1 ? Array.from({ length: totalPages }, (_, i) => {
        const pageNum = i + 1;
        return `<a href="${baseUrl}&page=${pageNum}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${pageNum === validPage ? 'bg-blue-800' : ''}">${pageNum}</a>`;
    }).join('') : '';
    return { videoList, pagination };
}

fetch('videos.json?t=' + new Date().getTime())
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch videos.json: ${response.statusText}`);
        return response.json();
    })
    .then(data => {
        const params = getUrlParams();
        const type = params.get('type') || 'home';
        const pageTitle = document.getElementById('page-title');
        const contentArea = document.getElementById('content-area');
        const relatedVideosArea = document.getElementById('related-videos');
        const relatedVideosList = document.getElementById('related-videos-list');
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
            document.title = 'ExclusiveClips4';
            pageTitle.textContent = 'Featured Videos';
            relatedVideosArea.classList.add('hidden');
            const videosPerPage = 10;
            const page = getPageNumber(params);
            const { videoList, pagination } = renderVideoList(sortedVideos, page, videosPerPage, 'index.html');
            contentArea.innerHTML = videoList;
            paginationArea.innerHTML = pagination;
        } else if (type === 'category' && params.get('name')) {
            const category = params.get('name').toLowerCase();
            const categoryVideos = sortedVideos.filter(video => video.category.toLowerCase() === category);
            document.title = `${category.charAt(0).toUpperCase() + category.slice(1)} - ExclusiveClips4`;
            pageTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Videos`;
            relatedVideosArea.classList.add('hidden');
            const videosPerPage = 10;
            const page = getPageNumber(params);
            const { videoList, pagination } = renderVideoList(categoryVideos, page, videosPerPage, `index.html?type=category&name=${category}`);
            contentArea.innerHTML = videoList;
            paginationArea.innerHTML = pagination;
            if (categoryVideos.length === 0) {
                contentArea.innerHTML = '<p class="text-red-500">No videos found for this category.</p>';
            }
        } else if (type === 'hashtag' && params.get('name')) {
            const hashtag = params.get('name');
            document.title = `#${hashtag} - ExclusiveClips4`;
            pageTitle.textContent = `#${hashtag} Videos`;
            relatedVideosArea.classList.add('hidden');
            const hashtagVideos = sortedVideos.filter(video => video.hashtags.includes(hashtag));
            contentArea.innerHTML = hashtagVideos.length ? hashtagVideos.map(video => `
                <div class="relative bg-gray-900 rounded-lg shadow-md overflow-hidden">
                    <a href="index.html?type=video&path=${video.video_page}">
                        <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-[290px] object-cover" onerror="this.src='https://via.placeholder.com/400x225?text=Thumbnail+Not+Found';">
                        <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">${video.views}</div>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-white">${video.title}</h3>
                        </div>
                    </a>
                </div>
            `).join('') : '<p class="text-red-500">No videos found for this hashtag.</p>';
            paginationArea.innerHTML = '';
        } else if (type === 'video' && params.get('path')) {
            const videoPath = params.get('path');
            const video = sortedVideos.find(v => v.video_page === videoPath);
            if (!video) {
                contentArea.innerHTML = '<p class="text-red-500">Video not found.</p>';
                relatedVideosArea.classList.add('hidden');
                paginationArea.innerHTML = '';
                return;
            }
            document.title = `${video.title} - ExclusiveClips4`;
            pageTitle.textContent = video.title;
            contentArea.innerHTML = `
                <div class="p-4 text-white text-center">
                    <p>This video is uploaded on <a href="https://t.me/exclusiveclips4" class="text-blue-400 hover:underline"><i class="fab fa-telegram-plane"></i> @exclusiveclips4</a></p>
                </div>
                <div class="relative bg-gray-900 rounded-lg shadow-md overflow-hidden">
                    <video controls class="w-full" onerror="this.parentElement.innerHTML='<p class=\"text-red-500\">Error loading video. Please try again later or check the video URL.</p>'">
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
                    <a href="https://t.me/exclusiveclips4" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Show More on Telegram</a>
                </div>
            `;
            // Render related videos
            const relatedVideos = sortedVideos.filter(v => v.category === video.category && v.id !== video.id).slice(0, 4);
            relatedVideosArea.classList.toggle('hidden', relatedVideos.length === 0);
            relatedVideosList.innerHTML = relatedVideos.length ? relatedVideos.map(v => `
                <div class="relative bg-gray-900 rounded-lg shadow-md overflow-hidden">
                    <a href="index.html?type=video&path=${v.video_page}">
                        <img src="${v.thumbnail}" alt="${v.title}" class="w-full h-[290px] object-cover" onerror="this.src='https://via.placeholder.com/400x225?text=Thumbnail+Not+Found';">
                        <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">${v.views}</div>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-white">${v.title}</h3>
                        </div>
                    </a>
                </div>
            `).join('') : '<p class="text-gray-400">No related videos available.</p>';
            paginationArea.innerHTML = '';
        } else {
            contentArea.innerHTML = '<p class="text-red-500">Invalid page.</p>';
            relatedVideosArea.classList.add('hidden');
            paginationArea.innerHTML = '';
        }
    })
    .catch(error => {
        console.error('Error loading videos:', error);
        document.getElementById('content-area').innerHTML = '<p class="text-red-500">Error loading videos. Please check if videos.json exists and is valid, then try again.</p>';
    });