import BottomTabBar from "@/components/BottomTabBar";

const pagesWithTabs = ["Today", "Habits", "Tasks", "Calendar", "Analytics", "Focus", "Settings"];

export default function Layout({ children, currentPageName }) {
  const showTabs = pagesWithTabs.includes(currentPageName);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto min-h-screen">
        <div className={showTabs ? "pb-24" : "pb-6"}>
          {children}
        </div>
        {showTabs && <BottomTabBar currentPage={currentPageName} />}
      </div>
    </div>
  );
}