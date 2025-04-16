import React, { useEffect } from "react";
import { getFollowing } from "@/api/user/userInfo";
import { useUserData } from "@/hooks/user/useUserData";

const Suggestions: React.FC = () => {
  const { userData, loading } = useUserData() as {
    userData: { id: string } | null;
    loading: boolean;
  };
  const [following, setFollowing] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (userData && userData.id) {
        const data = await getFollowing(userData.id);
        setFollowing(data || []);
      }
    };

    if (!loading) {
      fetchFollowing();
    }
  }, [userData, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0 h-full p-4 border">
      <div id="folllow_sug" className="flex-1 flex justify-center">
        {following.length > 0 ? (
          <ul>
            {following.map((user) => (
              <li key={user.id}>{user.username}</li>
            ))}
          </ul>
        ) : (
          <p>No suggestion available</p>
        )}
      </div>
      <div
        id="sep"
        className="h-0 w-full border-t-2 border-b-gray-600 m-5"
      ></div>
      <div id="random_sug" className="flex-1 flex justify-center">
        random suggestion
      </div>
    </div>
  );
};

export default Suggestions;
