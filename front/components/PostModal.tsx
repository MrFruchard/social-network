import React, { useEffect, useState } from "react";

interface PostModalProps {
  onClose: () => void;
}

interface Follower {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  image: string;
  about: string;
  followed: boolean;
}

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  const form = event.currentTarget;
  const formData = new FormData(form);
  const content = form.querySelector("textarea")?.value || "";
  const fileInput = form.querySelector<HTMLInputElement>("input[type='file']");
  const file = fileInput?.files?.[0];

  const privacyCheckbox = form.querySelector<HTMLInputElement>("#privacy");
  const privacyValue = privacyCheckbox?.checked ? "public" : "private";

  const selectedFollowers = Array.from(
    form.querySelectorAll<HTMLInputElement>("input[name='followers']:checked")
  ).map((input) => input.value);

  if (file) {
    formData.append("image", file);
  }

  formData.append("privacy", privacyValue);
  formData.append("content", content);
  formData.append("tags", content.match(/#[\w]+/g)?.join(" ") || "");
  formData.append("allowed_followers", JSON.stringify(selectedFollowers));

  const requestOptions = {
    method: "POST",
    body: formData,
  };

  fetch("http://localhost:80/api/posts", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

const PostModal: React.FC<PostModalProps> = ({ onClose }) => {
  const [followers, setFollowers] = useState<Follower[]>([]);

  useEffect(() => {
    const requestOptions: RequestInit = {
      method: "GET",
    };

    fetch("http://localhost:80/api/user/listfollower", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setFollowers(data.followers);
        }
      })
      .catch((error) => console.log("error", error));
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-background text-foreground p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
        <form
          id="post-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <textarea
            placeholder="What's on your mind?"
            className="bg-transparent border border-border p-3 rounded-lg min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
            required
          ></textarea>
          <input
            type="file"
            accept="image/gif, image/jpeg, image/png"
            className="border border-border p-2 rounded-lg"
          />
          <div className="flex">
            <input type="checkbox" name="Privacy" id="privacy" defaultChecked />
            <strong> Public</strong>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Select Followers</h3>
            <div className="max-h-40 overflow-y-auto border border-border p-2 rounded-lg">
              {followers.map((follower) => (
                <div
                  key={follower.user_id}
                  className="flex items-center gap-2 mb-2"
                >
                  <input
                    type="checkbox"
                    name="followers"
                    value={follower.user_id}
                    id={`follower-${follower.user_id}`}
                  />
                  <label
                    htmlFor={`follower-${follower.user_id}`}
                    className="flex items-center gap-2"
                  >
                    {follower.image && (
                      <img
                        src={follower.image}
                        alt={follower.username}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span>
                      {follower.first_name} {follower.last_name} (@
                      {follower.username})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
