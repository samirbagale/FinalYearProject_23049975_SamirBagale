import { useState, useEffect } from 'react';
import { forumService } from '@/services/forumService';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePostModal } from './CreatePostModal';

interface Post {
    _id: string;
    user: { _id: string, username: string };
    content: string;
    topic: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    isAnonymous: boolean;
}

interface ForumFeedProps {
    onSelectPost: (postId: string) => void;
}

export const ForumFeed = ({ onSelectPost }: ForumFeedProps) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [topicFilter, setTopicFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await forumService.getPosts(token, topicFilter);
            setPosts(res.data);
        } catch (err: any) {
            console.error('Failed to load posts', err);
            setError(err.message || 'Failed to load discussions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [topicFilter]);

    const handleDelete = async (postId: string) => {
        if (!window.confirm('Delete this post? This cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await forumService.deletePost(token, postId);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            console.error('Failed to delete post', err);
            alert('Could not delete post');
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await forumService.toggleLike(token, postId);
            const isLiked = res.data.liked;

            // Optimistic Update
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    return { ...p, likesCount: p.likesCount + (isLiked ? 1 : -1) };
                }
                return p;
            }));
        } catch (err) {
            console.error('Like failed', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="text-gray-600 font-medium">Filter by Topic:</span>
                    <select
                        value={topicFilter}
                        onChange={(e) => setTopicFilter(e.target.value)}
                        className="border rounded-md p-2 text-sm focus:ring-primary-500 capitalize text-gray-900"
                    >
                        <option value="all">All Topics</option>
                        {['anxiety', 'depression', 'stress', 'relationships', 'grief', 'trauma', 'self-care', 'motivation', 'sleep', 'general'].map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium flex items-center justify-center gap-2"
                >
                    ✏️ Start Discussion
                </button>
            </div>

            {/* Feed */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading discussions...</div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">{error}</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-500">No discussions found in this topic yet.</p>
                    <button onClick={() => setShowCreateModal(true)} className="text-primary-600 font-medium mt-2 hover:underline">
                        Be the first to post!
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post._id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${post.isAnonymous ? 'bg-gray-200 text-gray-600' : 'bg-primary-100 text-primary-700'
                                        }`}>
                                        {post.isAnonymous ? '?' : post.user?.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">
                                            {post.isAnonymous ? 'Anonymous' : post.user?.username}
                                        </span>
                                        <span className="text-xs text-gray-500 block">
                                            {new Date(post.createdAt).toLocaleDateString()} • <span className="capitalize bg-gray-100 px-1 rounded">{post.topic}</span>
                                        </span>
                                    </div>
                                </div>

                                {user?.id === post.user?._id && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}
                                        className="text-gray-400 hover:text-red-500 text-sm"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            <div
                                className="cursor-pointer mb-4"
                                onClick={() => onSelectPost(post._id)}
                            >
                                <p className="text-gray-800 whitespace-pre-line line-clamp-3">{post.content}</p>
                                {post.content.length > 150 && <span className="text-primary-600 text-sm hover:underline">Read more</span>}
                            </div>

                            <div className="flex items-center gap-6 border-t pt-3 text-gray-500 text-sm">
                                <button
                                    onClick={() => handleLike(post._id)}
                                    className="flex items-center gap-1 hover:text-primary-600 transition-colors"
                                >
                                    ❤️ {post.likesCount || 0} Likes
                                </button>
                                <button
                                    onClick={() => onSelectPost(post._id)}
                                    className="flex items-center gap-1 hover:text-primary-600 transition-colors"
                                >
                                    💬 {post.commentsCount || 0} Comments
                                </button>
                                <button className="flex items-center gap-1 hover:text-red-600 transition-colors ml-auto">
                                    🚩 Report
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onPostCreated={fetchPosts}
                />
            )}
        </div>
    );
};
