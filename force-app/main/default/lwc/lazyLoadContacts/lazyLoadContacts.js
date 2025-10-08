import { LightningElement, track } from 'lwc';
import fetchContacts from '@salesforce/apex/LazyLoadContactsController.fetchContacts';
import getTotalCount from '@salesforce/apex/LazyLoadContactsController.getTotalCount';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

export default class LazyLoadContacts extends LightningElement {
    @track contacts = [];
    @track isLoading = false;
    @track noResults = false;
    @track searchKey = '';

    totalCount = 0;
    loadedCount = 0;
    pageSize = 10;
    cacheKeyPrefix = 'lazyLoadContacts_';

    connectedCallback() {
        this.loadFromCache() || this.initData();
    }

    async initData() {
        this.loadedCount = 0;
        this.contacts = [];
        this.totalCount = await getTotalCount({ searchKey: this.searchKey });
        this.loadMoreData();
    }

    async loadMoreData() {
        if (this.loadedCount >= this.totalCount || this.isLoading) return;
        this.isLoading = true;

        try {
            const newContacts = await fetchContacts({
                offsetSize: this.loadedCount,
                limitSize: this.pageSize,
                searchKey: this.searchKey
            });

            this.contacts = [...this.contacts, ...newContacts];
            this.loadedCount += newContacts.length;
            this.noResults = this.contacts.length === 0;

            // Notify LDS cache that records have changed
            getRecordNotifyChange(
                newContacts.map(c => ({ recordId: c.Id }))
            );

            // Cache to session storage
            this.saveToCache();

        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            this.isLoading = false;
        }
    }

    handleScroll(event) {
        const element = event.target;
        const bottomReached = element.scrollTop + element.clientHeight >= element.scrollHeight - 20;
        if (bottomReached && !this.isLoading) {
            this.loadMoreData();
        }
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.clearCache();
            this.initData();
        }, 500);
    }

    // 🧠 --- Cache Methods ---
    get cacheKey() {
        return this.cacheKeyPrefix + (this.searchKey || 'all');
    }

    saveToCache() {
        const cacheData = {
            contacts: this.contacts,
            totalCount: this.totalCount,
            loadedCount: this.loadedCount
        };
        sessionStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    }

    loadFromCache() {
        const cached = sessionStorage.getItem(this.cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            this.contacts = data.contacts;
            this.totalCount = data.totalCount;
            this.loadedCount = data.loadedCount;
            this.noResults = this.contacts.length === 0;
            console.log('Loaded from cache');
            return true;
        }
        return false;
    }

    clearCache() {
        sessionStorage.removeItem(this.cacheKey);
    }
}
