import * as Toast from "@radix-ui/react-toast";

interface ToastProps {
  duration: number;
}

export function ToastCustom({ duration = 3000 }: ToastProps) {
  return (
    <Toast.Provider swipeDirection="right" duration={duration}>
      <Toast.Root duration={duration}>
        <Toast.Title>
          <h1>Title</h1>
        </Toast.Title>
        <Toast.Description>
          <p>Description</p>
        </Toast.Description>
        <Toast.Action altText="teste" asChild>
          <button>Undo</button>
        </Toast.Action>
        <Toast.Close />
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  );
}
