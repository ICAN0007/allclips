document.addEventListener('DOMContentLoaded', () => {
    let videos = [];
    const videosPerPage = 8;
    let currentPage = 1;
    let currentCategory = 'all';

    const videoContainer = document.getElementById('videoContainer');
    const pagination = document.getElementById('pagination');
    const videoPage = document.getElementById('videoPage');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const videoViews = document.getElementById('videoViews');
    const videoHashtags = document.getElementById('videoHashtags');
    const relatedVideos = document.getElementById('relatedVideos').querySelector('div');
    const categoryFilter = document.getElementById('category');

    // Load videos from JSON
    fetch('videos.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            videos = data.videos;
            populateCategories();
            displayVideos();
            checkVideoPage();
        })
        .catch(error => console.error('Error loading videos:', error));

    // Populate category filter
    function populateCategories() {
        const categories = [...new Set(videos.map(video => video.category))];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Display videos with pagination
    function displayVideos() {
        const filteredVideos = currentCategory === 'all' ? videos : videos.filter(video => video.category === currentCategory);
        const start = (currentPage - 1) * videosPerPage;
        const end = start + videosPerPage;
        const paginatedVideos = filteredVideos.slice(start, end);

        videoContainer.innerHTML = '';
        paginatedVideos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'bg-gray-800 p-4 rounded';
            videoCard.innerHTML = `
                <a href="?video=${video.video_page}">
                    <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-48 object-cover rounded mb-2">
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p class="text-gray-400">${video.views} views</p>
                </a>
            `;
            videoContainer.appendChild(videoCard);
        });

        updatePagination(filteredVideos.length);
    }

    // Update pagination controls
    function updatePagination(totalVideos) {
        const pageCount = Math.ceil(totalVideos / videosPerPage);
        pagination.innerHTML = '';
        for (let i = 1; i <= pageCount; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = `?page=${i}${currentCategory !== 'all' ? '&category=' + currentCategory : ''}`;
            pageLink.className = `mx-1 px-3 py-1 rounded ${i === currentPage ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-600`;
            pageLink.textContent = i;
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                displayVideos();
                window.history.pushState({}, '', pageLink.href);
            });
            pagination.appendChild(pageLink);
        }
    }

    // Check if on video page
    function checkVideoPage() {
        const params = new URLSearchParams(window.location.search);
        const videoPageParam = params.get('video');
        if (videoPageParam) {
            const video = videos.find(v => v.video_page === videoPageParam);
            if (video) {
                videoContainer.className = 'hidden';
                pagination.className = 'hidden';
                videoPage.className = 'block';
                videoTitle.textContent = video.title;
                videoViews.textContent = `${video.views} views`;
                videoHashtags.textContent = video.hashtags.join(' ');
                videoPlayer.innerHTML = `
                    <video controls class="w-full rounded" onerror="this.parentElement.innerHTML='<p class=&quot;text-red-500&quot;>Error loading video. Please try again later.</p>'">
                        <source src="${video.video_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
                displayRelatedVideos(video);
            } else {
                videoPlayer.innerHTML = '<p class="text-red-500">Video doesn\'t exist.</p>';
            }
        } else {
            videoContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
            pagination.className = 'flex justify-center mt-4';
            videoPage.className = 'hidden';
            const pageParam = params.get('page');
            currentPage = pageParam ? parseInt(pageParam) : 1;
            const categoryParam = params.get('category');
            currentCategory = categoryParam || 'all';
            categoryFilter.value = currentCategory;
            displayVideos();
        }
    }

    // Display related videos
    function displayRelatedVideos(currentVideo) {
        const related = videos.filter(v => v.category === currentVideo.category && v.id !== currentVideo.id).slice(0, 4);
        relatedVideos.innerHTML = '';
        if (related.length === 0) {
            relatedVideos.innerHTML = '<p class="text-gray-400">No related videos available.</p>';
            return;
        }
        related.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'bg-gray-800 p-4 rounded';
            videoCard.innerHTML = `
                <a href="?video=${video.video_page}">
                    <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-48 object-cover rounded mb-2">
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p class="text-gray-400">${video.views} views</p>
                </a>
            `;
            relatedVideos.appendChild(videoCard);
        });
    }

    // Handle category filter change
    categoryFilter.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        displayVideos();
        window.history.pushState({}, '', `?page=1${currentCategory !== 'all' ? '&category=' + currentCategory : ''}`);
    });

    // Handle popstate for back/forward navigation
    window.addEventListener('popstate', checkVideoPage);
});