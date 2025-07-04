'use server';

import { FollowRequest } from '@/types/followunfollowTypes';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

export const follow = async (data: FollowRequest) => {
  try {
    const res = await fetch(`${backendUrl}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.log(res.statusText);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const unfollow = async (data: FollowRequest) => {
  try {
    const res = await fetch(`${backendUrl}/unfollow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.log(res.statusText);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
