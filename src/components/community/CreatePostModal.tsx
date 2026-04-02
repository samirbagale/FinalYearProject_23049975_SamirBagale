import { useState } from 'react';
import { forumService } from '@/services/forumService';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

const TOPICS = [
    'anxiety', 'depression', 'stress', 'relationships', 'grief',
    'trauma', 'self-care', 'motivation', 'sleep', 'general'
];

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
    const [content, setContent] = useState('');
    const [topic, setTopic] = useState('general');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not logged in');

            await forumService.createPost(token, {
                content,
                topic,
                isAnonymous
            });

            setContent('');
            setIsAnonymous(false);
            onPostCreated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Create New Post</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full border rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 capitalize text-gray-900"
                        >
                            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Share your thoughts</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            maxLength={2000}
                            className="w-full border rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            placeholder="What's on your mind? This is a safe space."
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                            Post Anonymously (Hide my username)
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
