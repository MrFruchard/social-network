"use client";
import { useAuth } from "@/hooks/checkAuth";
import { LogoutButton } from "@/components/logout-button";
import { useUserData } from "@/hooks/useUserData";

export default function HomePage() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: "/",
  });

  if (authLoading || userDataLoading) {
    return <div>Loading...</div>;
  }

  // Si userData est null ou undefined, on affiche un message d'erreur
  if (!userData) {
    return <div>Impossible de charger les données utilisateur</div>;
  }

  return (
    <>
      {isAuthenticated && (
        <div className="grid grid-cols-5 grid-rows-5 gap-4 h-screen">
          <div className="row-span-5 border p-2">
            <ul>
              <li>{userData.username}</li>
              <li>2</li>
              <li>3</li>
              <li>4</li>
              <li>
                <LogoutButton />
              </li>
            </ul>
          </div>
          <div className="col-span-3 border p-4">{`Bienvenue, ${userData.username} !`}</div>
          <div className="row-span-5 col-start-5 border p-2">3</div>
          <div
            className="col-span-3 row-span-4 col-start-2 row-start-2 border p-3"
            id="main_container"
          >
            4
          </div>
          <button
            className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow"
            onClick={openPostForm}
          >
            New Post
          </button>
          <div
            className="fixed inset-0 flex items-center justify-center bg-blue-500 px-4 py-2 rounded shadow transition hidden"
            id="modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                const modal = document.getElementById("modal");
                if (modal) {
                  modal.classList.add("hidden");
                }
              }
            }}
          >
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
              <form id="post-form" className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="border p-2 rounded"
                  required
                />
                <textarea
                  placeholder="Content"
                  className="border p-2 rounded"
                  required
                ></textarea>
                <input
                  type="file"
                  accept="image/gif, image/jpeg, image/png"
                  className="border p-2 rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded shadow"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function openPostForm() {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.remove("hidden");
  }

  const form = document.getElementById("post-form") as HTMLFormElement;
  if (form) {
    form.onsubmit = async (event) => {
      event.preventDefault();

      const fileInput = form.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const titleInput = form.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = form.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;

      if (!titleInput || !contentTextarea) {
        console.error("Form elements are missing");
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append("Cookie", "session_id=");

      const formdata = new FormData();
      formdata.append("content", contentTextarea.value);
      formdata.append("tags", titleInput.value);
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formdata.append("image", fileInput.files[0], "");
      }

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
      };

      try {
        const response = await fetch(
          "http://localhost:80/api/posts",
          requestOptions
        );
        const result = await response.text();
        console.log(result);

        // Close the modal after successful submission
        if (modal) {
          modal.classList.add("hidden");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  }
}
