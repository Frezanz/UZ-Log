import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/hooks/useContent";
import { ContentItem, FilterState } from "@/types/content";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { ControlToggle } from "@/components/ControlToggle";
import { ContentCard } from "@/components/ContentCard";
import { ContentModal } from "@/components/modals/ContentModal";
import { ContentViewer } from "@/components/modals/ContentViewer";
import { ShareModal } from "@/components/modals/ShareModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { AutoDeleteModal } from "@/components/modals/AutoDeleteModal";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getAllPublicContent } from "@/lib/api";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    items,
    isLoading,
    filters,
    setFilters,
    createNewContent,
    editContent,
    removeContent,
    togglePublic,
    changeStatus,
    duplicateItem,
    getCategories,
    getTags,
  } = useContent();

  // For anonymous users viewing public content
  const [publicItems, setPublicItems] = useState<ContentItem[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const [publicFilters, setPublicFilters] = useState<FilterState>({
    searchQuery: "",
    categories: [],
    types: [],
    tags: [],
    sortBy: "newest",
  });

  // Modal states
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | undefined>();
  const [showViewer, setShowViewer] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareItem, setShareItem] = useState<ContentItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);
  const [showAutoDeleteModal, setShowAutoDeleteModal] = useState(false);
  const [autoDeleteItem, setAutoDeleteItem] = useState<ContentItem | null>(
    null,
  );
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showSortBy, setShowSortBy] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showTags, setShowTags] = useState(false);

  // Bulk selection states
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Scroll detection for hiding header and search bar
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  // Handle scroll to hide/show header and search bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollYRef.current;

      // Show header when at the top of page
      if (currentScrollY < 10) {
        setIsHeaderHidden(false);
      }
      // Hide header when scrolling down more than 5px with speed
      else if (scrollDifference > 5 && currentScrollY > 50) {
        setIsHeaderHidden(true);
      }
      // Show header immediately when scrolling up
      else if (scrollDifference < -5) {
        setIsHeaderHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Load public content for anonymous users (if Supabase is available)
  // If not, guests will just see their own localStorage content
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      const loadPublicContent = async () => {
        try {
          setPublicLoading(true);
          const content = await getAllPublicContent(publicFilters);
          setPublicItems(content);
        } catch (error) {
          // Silently fail if Supabase isn't configured
          // Guests can still use the app with localStorage content
          console.log(
            "Public content not available:",
            error instanceof Error ? error.message : "Unknown error",
          );
          setPublicItems([]);
        } finally {
          setPublicLoading(false);
        }
      };

      loadPublicContent();
    }
  }, [publicFilters, isAuthenticated, authLoading]);

  // Determine which data to display
  // Authenticated users see their Supabase content
  // Guest users see their localStorage content (items is populated from localStorage via useContent hook)
  // Filter out hidden items from display
  const displayItems = items.filter((item) => item.status !== "hidden");
  const displayLoading = isLoading;
  const displayFilters = filters;
  const setDisplayFilters = setFilters;

  const categories = getCategories();
  const tags = getTags();

  // Handle create/edit
  const handleSaveContent = async (data: Partial<ContentItem>) => {
    try {
      if (editingItem) {
        await editContent(editingItem.id, data);
      } else {
        await createNewContent(data);
      }
      setEditingItem(undefined);
    } catch (error) {
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting content:", id);
      await removeContent(id);
      console.log("Content deleted successfully:", id);
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting content:", error);
      throw error;
    }
  };

  // Handle share
  const handleTogglePublic = async (item: ContentItem, isPublic: boolean) => {
    try {
      await togglePublic(item.id, isPublic);
    } catch (error) {
      throw error;
    }
  };

  const handleOpenView = (item: ContentItem) => {
    setViewingItem(item);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setViewingItem(null);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setShowContentModal(true);
  };

  const handleOpenDelete = (item: ContentItem) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const handleOpenShare = (item: ContentItem) => {
    setShareItem(item);
    setShowShareModal(true);
  };

  const handleDownload = (item: ContentItem) => {
    if (item.file_url) {
      window.open(item.file_url, "_blank");
      toast.success("Downloading...");
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "pending" | "completed",
  ) => {
    // If changing to completed, show auto-delete modal
    if (status === "completed") {
      const item = items.find((i) => i.id === id);
      if (item) {
        setAutoDeleteItem(item);
        setPendingStatusId(id);
        setShowAutoDeleteModal(true);
      }
    } else {
      // For other status changes, apply immediately
      await changeStatus(id, status);
    }
  };

  const handleAutoDeleteConfirm = async (deleteAtTime: string | null) => {
    if (pendingStatusId) {
      await changeStatus(pendingStatusId, "completed", deleteAtTime);
      setPendingStatusId(null);
      setAutoDeleteItem(null);
    }
  };

  const handleDuplicate = async (item: ContentItem) => {
    try {
      await duplicateItem(item.id);
    } catch (error) {
      console.error("Error duplicating item:", error);
    }
  };

  // Bulk Operations
  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === displayItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(displayItems.map((item) => item.id));
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedItems) {
      try {
        await removeContent(id);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
    setSelectedItems([]);
    setShowBulkDeleteModal(false);
    toast.success("Items deleted successfully");
  };

  const handleBulkStatusChange = async (
    status: "active" | "pending" | "completed",
  ) => {
    for (const id of selectedItems) {
      try {
        await changeStatus(id, status);
      } catch (error) {
        console.error("Error changing status:", error);
      }
    }
    setSelectedItems([]);
    toast.success(`Status changed to ${status} for selected items`);
  };

  const handleBulkShare = async (isPublic: boolean) => {
    for (const id of selectedItems) {
      const item = items.find((i) => i.id === id);
      if (item) {
        try {
          await togglePublic(id, isPublic);
        } catch (error) {
          console.error("Error sharing item:", error);
        }
      }
    }
    setSelectedItems([]);
    toast.success(
      `Items marked as ${isPublic ? "public" : "private"} successfully`,
    );
  };

  const handleModalClose = () => {
    setShowContentModal(false);
    setEditingItem(undefined);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mb-4">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Header />}

      {/* Anonymous User Header */}
      {!isAuthenticated && (
        <header
          className={`fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out ${
            isHeaderHidden
              ? "-translate-y-full shadow-none"
              : "translate-y-0 shadow-md"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-foreground">
                  UZ-log
                </span>
              </div>
              <Button variant="outline" onClick={() => navigate("/settings")}>
                Settings
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 sm:pt-24">
        {/* Top Bar: Search and Actions */}
        <div
          className={`space-y-4 mb-6 transition-all duration-300 ease-in-out ${
            isHeaderHidden
              ? "-translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchBar
              value={displayFilters.searchQuery}
              onChange={(query) =>
                setDisplayFilters({ ...displayFilters, searchQuery: query })
              }
            />
          </div>

          {/* Control Toggle: Filter | Chevron | New Content */}
          <ControlToggle
            isExpanded={showActions}
            onToggle={setShowActions}
            onFilterClick={() => setShowFilters(!showFilters)}
            onNewContentClick={() => {
              setEditingItem(undefined);
              setShowContentModal(true);
            }}
            isFilterActive={showFilters}
          >
            {/* Filters Section - Nested inside ControlToggle children */}
            {showFilters && (
              <div className="space-y-4">
                  {/* Sort Options */}
                  <div className="text-center space-y-2">
                    <h3 className="text-sm font-medium text-foreground">
                      Sort By
                    </h3>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowSortBy(!showSortBy)}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                        title={
                          showSortBy ? "Hide sort options" : "Show sort options"
                        }
                      >
                        <ChevronDown
                          className="w-5 h-5 transition-transform duration-200"
                          style={{
                            transform: showSortBy
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </button>
                    </div>

                    {showSortBy && (
                      <div className="flex flex-wrap gap-2 justify-center animate-in fade-in duration-200">
                        {(
                          ["newest", "oldest", "a-z", "word-count"] as const
                        ).map((option) => (
                          <Button
                            key={option}
                            variant={
                              displayFilters.sortBy === option
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setDisplayFilters({
                                ...displayFilters,
                                sortBy: option,
                              })
                            }
                          >
                            {option === "newest"
                              ? "Newest"
                              : option === "oldest"
                                ? "Oldest"
                                : option === "a-z"
                                  ? "A-Z"
                                  : "Word Count"}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="text-center space-y-2">
                      <h3 className="text-sm font-medium text-foreground">
                        Categories
                      </h3>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowCategories(!showCategories)}
                          className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                          title={
                            showCategories
                              ? "Hide categories"
                              : "Show categories"
                          }
                        >
                          <ChevronDown
                            className="w-5 h-5 transition-transform duration-200"
                            style={{
                              transform: showCategories
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          />
                        </button>
                      </div>

                      {showCategories && (
                        <div className="flex flex-wrap gap-2 justify-center animate-in fade-in duration-200">
                          {categories.map((cat) => (
                            <Button
                              key={cat}
                              variant={
                                displayFilters.categories.includes(cat)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => {
                                const newCategories =
                                  displayFilters.categories.includes(cat)
                                    ? displayFilters.categories.filter(
                                        (c) => c !== cat,
                                      )
                                    : [...displayFilters.categories, cat];
                                setDisplayFilters({
                                  ...displayFilters,
                                  categories: newCategories,
                                });
                              }}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tag Filter */}
                  {tags.length > 0 && (
                    <div className="text-center space-y-2">
                      <h3 className="text-sm font-medium text-foreground">
                        Tags
                      </h3>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowTags(!showTags)}
                          className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                          title={showTags ? "Hide tags" : "Show tags"}
                        >
                          <ChevronDown
                            className="w-5 h-5 transition-transform duration-200"
                            style={{
                              transform: showTags
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          />
                        </button>
                      </div>

                      {showTags && (
                        <div className="flex flex-wrap gap-2 justify-center animate-in fade-in duration-200">
                          {tags.slice(0, 10).map((tag) => (
                            <Button
                              key={tag}
                              variant={
                                displayFilters.tags.includes(tag)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => {
                                const newTags = displayFilters.tags.includes(
                                  tag,
                                )
                                  ? displayFilters.tags.filter((t) => t !== tag)
                                  : [...displayFilters.tags, tag];
                                setDisplayFilters({
                                  ...displayFilters,
                                  tags: newTags,
                                });
                              }}
                            >
                              #{tag}
                            </Button>
                          ))}
                          {tags.length > 10 && (
                            <span className="text-xs text-muted-foreground px-2 py-1.5">
                              +{tags.length - 10} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDisplayFilters({
                          searchQuery: "",
                          categories: [],
                          types: [],
                          tags: [],
                          sortBy: "newest",
                        });
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}
            </ControlToggle>

          {/* Results Info */}
          {displayItems.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing {displayItems.length} content item
              {displayItems.length !== 1 ? "s" : ""}
              {displayFilters.searchQuery &&
                ` for "${displayFilters.searchQuery}"`}
              {!isAuthenticated && " (Public Library)"}
            </p>
          )}
        </div>

        {/* Content Grid */}
        {displayLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="border border-border rounded-lg bg-card h-64 animate-pulse"
              />
            ))}
          </div>
        ) : displayItems.length > 0 ? (
          <div>
            {/* Bulk Selection Toolbar */}
            {selectedItems.length > 0 && (
              <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === displayItems.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded border border-border cursor-pointer"
                    title="Select all"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {selectedItems.length} item
                    {selectedItems.length !== 1 ? "s" : ""} selected
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange("active")}
                  >
                    Mark Active
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange("pending")}
                  >
                    Mark Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkShare(true)}
                  >
                    Make Public
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkShare(false)}
                  >
                    Make Private
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayItems.map((item) => (
                <div key={item.id} className="relative">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="absolute top-3.5 left-5 z-20 w-3 h-3 rounded border border-border cursor-pointer bg-background hover:bg-secondary transition-colors accent-primary"
                    title="Select item"
                  />
                  <ContentCard
                    item={item}
                    onView={handleOpenView}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onShare={handleOpenShare}
                    onDuplicate={handleDuplicate}
                    onStatusChange={handleStatusChange}
                    onDownload={handleDownload}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-secondary/50 rounded-full p-3 mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No content yet
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {displayFilters.searchQuery
                ? "No results found. Try adjusting your search."
                : "Create your first content to get started!"}
            </p>
            {!displayFilters.searchQuery && (
              <Button
                onClick={() => {
                  setEditingItem(undefined);
                  setShowContentModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Modals - Available for all users */}
      <ContentModal
        isOpen={showContentModal}
        onClose={handleModalClose}
        onSave={handleSaveContent}
        initialData={editingItem}
      />

      <ContentViewer
        isOpen={showViewer}
        onClose={handleCloseViewer}
        content={viewingItem}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onShare={handleOpenShare}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        item={shareItem}
        onTogglePublic={handleTogglePublic}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        onConfirm={() =>
          deleteItem ? handleDelete(deleteItem.id) : Promise.resolve()
        }
        title={deleteItem?.title || "Content"}
      />

      <AutoDeleteModal
        isOpen={showAutoDeleteModal}
        onClose={() => {
          setShowAutoDeleteModal(false);
          setAutoDeleteItem(null);
          setPendingStatusId(null);
        }}
        onConfirm={handleAutoDeleteConfirm}
        itemTitle={autoDeleteItem?.title || "Item"}
      />

      <DeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title={`${selectedItems.length} Item${selectedItems.length !== 1 ? "s" : ""}`}
      />
    </div>
  );
}
