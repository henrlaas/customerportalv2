
import React, { useState } from 'react';
import { Campaign } from './types/campaign';
import { EmptyState } from './EmptyState';
import { CampaignCardEnhanced } from './CampaignCardEnhanced';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onCreateClick: () => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ 
  campaigns, 
  isLoading, 
  onCreateClick 
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  
  // Get campaigns for current page
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll back to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Calculate page numbers to display
  const getPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        // Add ellipsis if currentPage is far from the start
        pages.push(-1); // -1 indicates ellipsis
      }
      
      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        // Add ellipsis if currentPage is far from the end
        pages.push(-2); // -2 indicates ellipsis (using different value for unique key)
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(4).fill(0).map((_, index) => (
          <div key={`skeleton-${index}`} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.05,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <CampaignCardEnhanced campaign={campaign} />
          </motion.div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPagination().map((page, index) => (
              <PaginationItem key={`page-${page}-${index}`}>
                {page < 0 ? (
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                ) : (
                  <PaginationLink 
                    href="#" 
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
