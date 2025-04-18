import React from "react";

interface PostModalProps {
  onClose: () => void;
}

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  const form = event.currentTarget;
  const formData = new FormData(form);

  const privacyCheckbox = form.querySelector<HTMLInputElement>("#privacy");
  const privacyValue = privacyCheckbox?.checked ? "private" : "public";

  formData.append("privacy", privacyValue);

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
              <input type="checkbox" name="Privacy" id="privacy" />
              <strong> privacy</strong>
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