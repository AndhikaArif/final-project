import toast from "react-hot-toast";

export function confirmDelete(onConfirm: () => void, message?: string) {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <span className="font-medium">
        {message ?? "Delete this item permanently?"}
      </span>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  ));
}
