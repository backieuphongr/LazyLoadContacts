import { LightningElement, track } from 'lwc';
import fetchContacts from '@salesforce/apex/LazyLoadContactsController.fetchContacts';
import getTotalCount from '@salesforce/apex/LazyLoadContactsController.getTotalCount';

export default class LazyLoadContacts extends LightningElement {
    @track contacts = [];
    @track isLoading = false;

    totalCount = 0;
    loadedCount = 0;
    pageSize = 10;

    connectedCallback() {
        this.initData();
    }

    async initData() {
        this.totalCount = await getTotalCount();
        this.loadMoreData();
    }

    async loadMoreData() {
        if (this.loadedCount >= this.totalCount || this.isLoading) return;
        this.isLoading = true;

        try {
            const newContacts = await fetchContacts({ offsetSize: this.loadedCount, limitSize: this.pageSize });
            this.contacts = [...this.contacts, ...newContacts];
            this.loadedCount += newContacts.length;
        } catch (error) {
            console.error('Error fetching contacts', error);
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
}
