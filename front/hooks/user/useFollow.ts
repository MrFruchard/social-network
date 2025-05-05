import { useState } from 'react';
import { followUser, checkFollowStatus, unfollowUser, getFollowRequests, abortFollowRequest } from '../../api/user/userInfo';

export const useFollow = (userId?: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followRequests, setFollowRequests] = useState<any[]>([]);

  const checkStatus = async (targetId?: string) => {
    if (!targetId && !userId) return;
    
    setLoading(true);
    try {
      const data = await checkFollowStatus(targetId || userId || '');
      setIsFollowing(data.isFollowing);
      setIsRequested(data.isRequested);
      setLoading(false);
    } catch (err) {
      setError('Failed to check follow status');
      setLoading(false);
    }
  };

  const follow = async (targetId?: string) => {
    if (!targetId && !userId) return;
    
    setLoading(true);
    try {
      const data = await followUser(targetId || userId || '');
      if (data.success) {
        await checkStatus(targetId || userId);
      }
      setLoading(false);
      return data;
    } catch (err) {
      setError('Failed to follow user');
      setLoading(false);
      throw err;
    }
  };

  const unfollow = async (targetId?: string) => {
    if (!targetId && !userId) return;
    
    setLoading(true);
    try {
      const data = await unfollowUser(targetId || userId || '');
      if (data.success) {
        await checkStatus(targetId || userId);
      }
      setLoading(false);
      return data;
    } catch (err) {
      setError('Failed to unfollow user');
      setLoading(false);
      throw err;
    }
  };

  const abortRequest = async (targetId?: string) => {
    if (!targetId && !userId) return;
    
    setLoading(true);
    try {
      const data = await abortFollowRequest(targetId || userId || '');
      if (data.success) {
        setIsRequested(false);
        await checkStatus(targetId || userId);
      }
      setLoading(false);
      return data;
    } catch (err) {
      setError('Failed to cancel follow request');
      setLoading(false);
      throw err;
    }
  };

  const fetchFollowRequests = async () => {
    setLoading(true);
    try {
      const data = await getFollowRequests();
      setFollowRequests(data.requests || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch follow requests');
      setLoading(false);
    }
  };

  return {
    isFollowing,
    isRequested,
    loading,
    error,
    followRequests,
    follow,
    unfollow,
    checkStatus,
    fetchFollowRequests,
    abortRequest
  };
};