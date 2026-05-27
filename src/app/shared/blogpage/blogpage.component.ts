import { Component, HostListener } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';
declare var bootstrap: any;
@Component({
  selector: 'app-blogpage',
  templateUrl: './blogpage.component.html',
  styleUrls: ['./blogpage.component.scss'],
})
export class BlogpageComponent {
  blogs: any = [
    {
      title: 'How to build a website',
      image: 'assets/blog-1.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-2.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-3.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-1.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-2.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-3.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-1.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-2.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
    {
      title: 'How to build a website',
      image: 'assets/blog-3.jpg',
      category: 'Web Design',
      author: 'John Doe',
      date: '01 Jan, 2045',
      description:
        'Dolor et eos labore stet justo sed est sed sed sed dolor stet amet',
      link: '#',
    },
  ];

  recentPosts: any = [];

  constructor(private apiservice: ApiService, public router: Router, private meta: Meta, private title: Title) { }

  blogData: any = [];
  isMobile: Boolean = false;
  ngOnInit(): void {
    this.isMobile = this.apiservice.isMobileDevice();
    this.getBlogList();
    this.gettags();
    this.updateMetaTags()
  }
  searchKeyword: string = ''; // For binding the input

  onSearchSubmit() {
    if (this.searchKeyword.trim() === '') {
      this.getBlogList(); // reload all blogs if search is cleared
    } else {
      this.getBlogList();
    }
  }
  isLoading1: boolean = false;
  //  onTagScroll(event: any) {
  //   const element = event.target;
  //   const threshold = 100; // pixels from bottom before triggering load

  //   if (
  //     element.scrollHeight - element.scrollTop - element.clientHeight <
  //     threshold &&
  //     !this.isLoading1 &&
  //     !this.allReviewsLoaded
  //   ) {
  //     this.pageIndex++;
  //     this.gettags();
  //   }
  // }




  allTagsLoaded: boolean = false;






  onTagScroll(event: any): void {
    const element = event.target;
    const threshold = 100;

    if (
      element.scrollHeight - element.scrollTop - element.clientHeight < threshold &&
      !this.isLoading1 &&
      !this.allTagsLoaded
    ) {
      this.isLoading1 = true;
      this.pageIndex1++;

      const prevLength = this.Tags?.length || 0;

      this.gettags();

      // Use a short delay to wait for gettags() to complete and Tags to update
      setTimeout(() => {
        const newLength = this.Tags?.length || 0;

        // If tag count did not increase, assume all tags loaded
        if (newLength === prevLength) {
          this.allTagsLoaded = true;
        }

        this.isLoading1 = false;
      }, 500); // Adjust if needed based on response speed
    }
  }












  retriveimgUrl = this.apiservice.retriveimgUrl;
  searchLoading: boolean = false;
  Tags: any = [];
  Categories: any = [];
  // tagscount: any = 10;
  total: any;

  gettags() {
    this.apiservice.getTagsDataForBlogs(this.pageIndex1, this.pageSize1, '', '').subscribe(
      (data: any) => {

        if (data?.code == 200 && data?.data?.length > 0) {
          if (
            this.Tags !== undefined &&
            this.Tags !== null &&
            this.Tags !== ''
          ) {
            if(data['data'][0]['tag'] !== undefined &&
            data['data'][0]['tag'] !== null &&
            data['data'][0]['tag'] !== ''){
            this.Tags = data['data'][0]['tag']
              .split(',')
              .map((g: any) => g.trim());
          } else {
            this.Tags = [];
          }
          } else {
            this.Tags = [];
          }
          // this.Tags=data['data'];
        } else {
          this.Tags = [];
        }
      },
      (err) => {
        this.Tags = [];
      }
    );

    this.apiservice.getCategoriesDataForBlogs().subscribe(
      (data: any) => {
        if (data?.code == 200 && data?.data?.length > 0) {
          if (
            this.Categories !== undefined &&
            this.Categories !== null &&
            this.Categories !== ''
          ) {
            this.Categories = data['data']
          } else {
            this.Categories = [];
          }
        } else {
          this.Categories = [];
        }
      },
      (err) => {
        this.Categories = [];
      }
    );
  }



  allReviewsLoaded: boolean = false;
  isLoading = false;
  reviewscount: any = 0;
  pageIndex = 1;
  pageSize = 6;
  pageIndex1 = 1;
  pageSize1 = 20;
  columns: string[][] = [
    ['TITLE'],
    ['SUB_TITLE'],
    ['HASHTAGS'],
    ['DESCRIPTION'],
    ['BLOG_WRITTER'],
  ];

  onKeyup(event: KeyboardEvent) {
    if (this.searchKeyword.length >= 3 && event.key === 'Enter') {
      this.getBlogList(true);
    } else if (this.searchKeyword.length == 0 && event.key === 'Backspace') {
      this.getBlogList(true);
    }
  }
  onSearchClick(): void {
    if (this.searchKeyword.length >= 3 || this.searchKeyword.length === 0) {
      this.getBlogList(true);
    }
  }

  CategoryDataA: any = [];
  CategoryDataP: any = [];
  CategoryDataE: any = [];
  selectedTags: string[] = [];
  activeFilter: string = 'category';
  selectedCategories: string[] = [];

  selectTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
  }

  selectCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
  }

  selecttag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag); // Add tag if not already selected
    } else {
      this.selectedTags.splice(index, 1); // Remove tag if already selected
    }
    // this.closeModal();
    this.getBlogList(true)

    // Call your filter logic
  }

  selecttagcat(tag: string) {
    const index = this.selectedCategories.indexOf(tag);
    if (index === -1) {
      this.selectedCategories.push(tag); // Add tag if not already selected
    } else {
      this.selectedCategories.splice(index, 1); // Remove tag if already selected
    }
    // this.closeModal();
    this.getBlogList(true)

    // Call your filter logic
  }

  clearAllTags() {
    this.selectedTags = [];
    this.closeModal();
    this.getBlogList(true); // Trigger the filter reset
  }

  clearAllTagscat() {
    this.selectedCategories = [];
    this.closeModal();
    this.getBlogList(true); // Trigger the filter reset
  }




  closeModal() {
    const modal = document.getElementById('mobileFilterModal');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
    }
  }


  isSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }
  isSelectedcat(tag: string): boolean {
    return this.selectedCategories.includes(tag);
  }



@HostListener('window:scroll', [])
onWindowScroll(): void {
  if (this.isLoading || this.allReviewsLoaded) return;

  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  // Trigger load when user is 300px near the bottom
  if (scrollPosition >= pageHeight - 600) {
  this.pageIndex++;
  this.getBlogList();
}

}

skeletonload : boolean = false
getBlogList(reset: boolean = false) {
  if (reset) {
    this.recentPosts = [];
    this.reviewscount = 0;
    this.pageIndex = 1;
    this.allReviewsLoaded = false;
    this.searchLoading = false;
  }
  if (this.isLoading || this.allReviewsLoaded) return;

  let filters: string = '';
  let FilterQuery: string = '';

  if (this.searchKeyword?.trim() !== '') {
    filters = ' AND (';
    this.columns.forEach((column) => {
      filters += ` ${column[0]} like '%${this.searchKeyword}%' OR`;
    });
    filters = filters.substring(0, filters.length - 2) + ')';
  }
  FilterQuery = filters;

  const tagFilter =
    this.selectedTags.length > 0 ? this.selectedTags.join(',') : null;
  const categoryFilter =
    this.selectedCategories.length > 0
      ? this.selectedCategories.join(',')
      : null;

  this.isLoading = true;
  this.skeletonload = true
  // this.searchLoading = true;

 this.apiservice
    .getBlogData2(
      this.pageIndex,
      this.pageSize,
      'ID',
      'desc',
      filters + " AND IS_ACTIVE =1",
      tagFilter,
      categoryFilter,
      0
    )
    .subscribe(
      (data: any) => {
        // Use timeout to keep skeleton visible for at least 500ms
        setTimeout(() => {
          if (data.code === 200) {
            this.reviewscount = data.count;
          } else {
            this.reviewscount = 0;
          }

          if (data.code === 200 && data.data?.length > 0) {
            this.CategoryDataA = data.Activity ?? data.Activities ?? [];
            this.CategoryDataP = data.Plays ?? [];
            this.CategoryDataE = data.Events ?? [];

            // Append new posts
            this.recentPosts = [...this.recentPosts, ...data.data];

            this.allReviewsLoaded = this.recentPosts.length >= this.reviewscount;
          } else {
            if (reset) {
              this.recentPosts = [];
              this.CategoryDataA = [];
              this.CategoryDataP = [];
              this.CategoryDataE = [];
              this.reviewscount = 0;
            }
            this.allReviewsLoaded = true;
          }

          this.isLoading = false;
          this.skeletonload = false
          // this.searchLoading = false;
        }, 500); // adjust time for smoothness
      },
      (error) => {
        setTimeout(() => {
          this.recentPosts = [];
          this.CategoryDataA = [];
          this.CategoryDataP = [];
          this.CategoryDataE = [];
          this.reviewscount = 0;
          this.isLoading = false;
          this.skeletonload = false
          // this.searchLoading = false;
          this.allReviewsLoaded = true;
        }, 500);
      }
    );
}


  // getBlogList(reset: boolean = false) {
  //   if (reset) {
  //     this.recentPosts = [];
  //     this.reviewscount = 0;
  //     this.pageIndex = 1;
  //     this.allReviewsLoaded = false;
  //     this.searchLoading = false;
  //   }
  //   if (this.isLoading || this.allReviewsLoaded) return;

  //   var filters: any = '';
  //   var FilterQuery: any = '';
  //   if (this.searchKeyword.trim() !== '' && this.searchKeyword != null) {
  //     filters = ' AND (';
  //     this.columns.forEach((column) => {
  //       filters += ' ' + column[0] + " like '%" + this.searchKeyword + "%' OR";
  //     });
  //     filters = filters.substring(0, filters.length - 2) + ')';
  //   } else {
  //     filters = '';
  //   }
  //   FilterQuery = filters;
  //   var tagFilter =
  //     this.selectedTags.length > 0 ? this.selectedTags.join(',') : null;
  //   var categoryFilter = this.selectedCategories.length > 0 ? this.selectedCategories.join(',') : null;

  //   this.isLoading = true;
  //   this.searchLoading = true;
  //   this.apiservice
  //     .getBlogData2(
  //       this.pageIndex,
  //       this.pageSize,
  //       'ID',
  //       'desc',
  //       FilterQuery,
  //       tagFilter,
  //       categoryFilter,
  //       0
  //     )
  //     .subscribe(
  //       (data: any) => {
  //         if (data['code'] === 200) {
  //           this.reviewscount = data['count'];
  //         } else {
  //           this.reviewscount = 0;
  //         }
  //         if (data['code'] === 200 && data['data'].length > 0) {
  //           if (data?.Activity) {
  //             this.CategoryDataA = data?.Activity;
  //           } else {
  //             this.CategoryDataA = data?.Activities;
  //           }
  //           this.CategoryDataP = data?.Plays;
  //           this.CategoryDataE = data?.Events;
  //           this.recentPosts = [...this.recentPosts, ...data['data']];
  //           if (this.recentPosts.length < this.reviewscount) {
  //             this.allReviewsLoaded = false;
  //           } else {
  //             this.allReviewsLoaded = true;
  //           }
  //           this.searchLoading = false;
  //         } else {
  //           this.recentPosts = [];
  //           this.CategoryDataA = [];
  //           this.CategoryDataP = [];
  //           this.CategoryDataE = [];
  //           this.reviewscount = 0;
  //           this.allReviewsLoaded = true;
  //           this.searchLoading = false;
  //         }
  //         this.isLoading = false;
  //       },
  //       (error: any) => {
  //         this.recentPosts = [];
  //         this.CategoryDataA = [];
  //         this.CategoryDataP = [];
  //         this.CategoryDataE = [];
  //         this.reviewscount = 0;
  //         this.searchLoading = false;
  //         this.allReviewsLoaded = true;
  //         this.isLoading = false;
  //       }
  //     );
  // }

  onScroll(event: any) {
    const element = event.target;
    const threshold = 100; // pixels from bottom before triggering load

    if (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      threshold &&
      !this.isLoading &&
      !this.allReviewsLoaded
    ) {
      this.pageIndex++;
      this.getBlogList();
    }
  }

  getPlainTextFromHTML(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent?.trim() || '';
  }

  selectedFacilities: string[] = [];

  toggleFacility(facility: string) {
    const index = this.selectedFacilities.indexOf(facility);
    if (index > -1) {
      this.selectedFacilities.splice(index, 1); // remove if already selected
    } else {
      this.selectedFacilities.push(facility);
    }
  }

  isFacilitySelected(facility: string): boolean {
    return this.selectedFacilities.includes(facility);
  }



  blogClick(blog: any) {
    var name: any = blog.TITLE.toLowerCase()
      .replace(/[\/\\,]+/g, '') // Remove /, \, ,
      .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim(); // Trim leading/trailing spaces

    if (
      blog.SLUG !== undefined &&
      blog.SLUG.trim() !== '' &&
      blog.SLUG !== null
    ) {
      this.router.navigate(['blog-details/', blog.SLUG.toLowerCase()], {
        queryParams: { id: blog.ID },
      });
      //       this.router.navigate([slug], {
      //   queryParams: { id: blog.ID }
      // });
    } else {
      this.router.navigate(['blog-details/', name], {
        queryParams: { id: blog.ID },
      });
    }
  }


  openMobileFilters() {
    const modal = new bootstrap.Modal(document.getElementById('mobileFilterModal')!);
    modal.show();
  }
  applyFilters() {
    this.getBlogList(true);
    const modalEl = document.getElementById('mobileFilterModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    this.closeModal();
  }

  clearAllFilters() {
    this.selectedTags = [];
    this.selectedCategories = [];
    this.selectedFacilities = [];
    this.getBlogList(true);
    const modalEl = document.getElementById('mobileFilterModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    this.closeModal();
  }

  clearTagsOnly() {
    this.selectedTags = [];
    // this.getBlogList(true);
  }

  clearCategoriesOnly() {
    this.selectedCategories = [];
    // this.getBlogList(true);
  }
  tagSearchTerm: string = '';

  filteredTags(): string[] {
    if (!this.tagSearchTerm) {
      return this.Tags;
    }
    return this.Tags.filter((tag: any) =>
      tag.toLowerCase().includes(this.tagSearchTerm.toLowerCase())
    );
  }


  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Blogs');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}
