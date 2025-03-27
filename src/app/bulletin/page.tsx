'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface RequestItem {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    submittedAt: string;
}

export default function BulletinBoard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [formData, setFormData] = useState({ title: '', description: '', type: 'bug' });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch requests on mount
    useEffect(() => {
        fetch('/api/requests')
            .then((res) => res.json())
            .then((data) => setRequests(data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            const newReq = await res.json();
            setRequests((prev) => [...prev, newReq]);
            setFormData({ title: '', description: '', type: 'bug' });
        }
        setIsLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const res = await fetch('/api/requests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus })
        });
        if (res.ok) {
            const updated = await res.json();
            setRequests((prev) =>
                prev.map((req) => (req.id === id ? updated : req))
            );
        }
    };

    return (
        <div className="min-h-screen bg-theme-gradient p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-theme">Bulletin Board</h1>
                    <Link href="/" className="text-primary hover:underline">
                        Back to Chat
                    </Link>
                </header>

                {/* Submission Form */}
                <div className="bg-card shadow rounded-lg p-6 mb-8 border border-theme">
                    <h2 className="text-2xl font-semibold text-theme mb-4">Submit a Request</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 border border-theme rounded bg-transparent text-theme placeholder:text-theme/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 border border-theme rounded bg-transparent text-theme placeholder:text-theme/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={4}
                            required
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full sm:w-auto p-3 border border-theme rounded bg-transparent text-theme placeholder:text-theme/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="bug">Bug Report</option>
                                <option value="feature">Feature Request</option>
                            </select>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Request List */}
                <div>
                    <h2 className="text-3xl font-bold text-theme mb-6">All Requests</h2>
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-card shadow rounded-lg p-6 border border-theme">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-theme">{req.title}</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            req.status === 'Pending'
                                                ? 'bg-gray-200 text-gray-800'
                                                : req.status === 'Work in Progress'
                                                    ? 'bg-yellow-200 text-yellow-800'
                                                    : 'bg-green-200 text-green-800'
                                        }`}
                                    >
                    {req.status}
                  </span>
                                </div>
                                <p className="mt-2 text-theme">{req.description}</p>
                                <p className="mt-1 text-gray-500 text-sm">
                                    Type: <span className="font-semibold">{req.type}</span> • Submitted:{' '}
                                    {new Date(req.submittedAt).toLocaleString()}
                                </p>
                                {user?.isAdmin && (
                                    <div className="mt-4 flex gap-3">
                                        <button
                                            onClick={() => updateStatus(req.id, 'Work in Progress')}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                        >
                                            Mark as WIP
                                        </button>
                                        <button
                                            onClick={() => updateStatus(req.id, 'Resolved')}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                        >
                                            Mark as Resolved
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
