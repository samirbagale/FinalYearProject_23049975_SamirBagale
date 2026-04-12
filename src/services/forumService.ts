const API_URL = 'http://127.0.0.1:5000/api/forum';
const MODERATION_URL = 'http://127.0.0.1:5000/api/moderation';

// Helper to get headers
const getHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export const forumService = {
    // --- POSTS ---

    // Get all posts (or filter by topic)
    getPosts: async (token: string, topic?: string) => {
        let url = `${API_URL}/posts`;
        if (topic && topic !== 'all') {
            url += `?topic=${topic}`;
        }

        const res = await fetch(url, { headers: getHeaders(token) });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to fetch posts');
        }
        return res.json();
    },

    // Create new post
    createPost: async (token: string, data: any) => {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create post');
        return res.json();
    },

    // Get single post
    getPost: async (token: string, id: string) => {
        const res = await fetch(`${API_URL}/posts/${id}`, { headers: getHeaders(token) });
        if (!res.ok) throw new Error('Failed to fetch post');
        return res.json();
    },

    // Delete post
    deletePost: async (token: string, id: string) => {
        const res = await fetch(`${API_URL}/posts/${id}`, {
            method: 'DELETE',
            headers: getHeaders(token)
        });
        if (!res.ok) throw new Error('Failed to delete post');
        return res.json();
    },

    // --- COMMENTS ---

    getComments: async (token: string, postId: string) => {
        const res = await fetch(`${API_URL}/posts/${postId}/comments`, { headers: getHeaders(token) });
        if (!res.ok) throw new Error('Failed to fetch comments');
        return res.json();
    },

    addComment: async (token: string, postId: string, content: string, isAnonymous: boolean) => {
        const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ content, isAnonymous })
        });
        if (!res.ok) throw new Error('Failed to add comment');
        return res.json();
    },

    // --- SOCIAL ---

    toggleLike: async (token: string, postId: string) => {
        const res = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: getHeaders(token)
        });
        if (!res.ok) throw new Error('Failed to like post');
        return res.json();
    },

    // --- MODERATION ---

    reportContent: async (token: string, targetId: string, targetType: 'post' | 'comment', reason: string) => {
        const res = await fetch(`${MODERATION_URL}/report`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ targetId, targetType, reason })
        });
        if (!res.ok) throw new Error('Failed to report content');
        return res.json();
    }
};
