import { LightningElement, track, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';

const PAGE_SIZE = 10;

export default class LazyLoadContactsLds extends LightningElement {
    @track contacts = [];
    @track isLoading = false;
    @track noResults = false;
    @track searchKey = '';

    nextPageToken;
    done = false;

    @wire(getListUi, {
        objectApiName: CONTACT_OBJECT,
        listViewApiName: 'AllContacts',
        pageSize: PAGE_SIZE
    })
    wiredContacts({ data, error }) {
        if (data) {
            this.contacts = data.records.records;
            this.nextPageToken = data.records.nextPageToken;
            this.done = !this.nextPageToken;
        } else if (error) {
            console.error('Error loading contacts:', error);
        }
    }

    handleScroll(event) {
        const el = event.target;
        const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
        if (bottom && !this.isLoading && !this.done) {
            this.loadNextPage();
        }
    }

    loadNextPage() {
        if (!this.nextPageToken) return;
        this.isLoading = true;

        // Instead of calling getListUi() imperatively, 
        // we create a new wire context manually using dynamic wire params
        this.pageParams = {
            objectApiName: CONTACT_OBJECT,
            listViewApiName: 'AllContacts',
            pageToken: this.nextPageToken,
            pageSize: PAGE_SIZE
        };

        this.loadMore();
    }

    @wire(getListUi, { objectApiName: CONTACT_OBJECT, listViewApiName: 'AllContacts', pageToken: '$pageParams.pageToken', pageSize: PAGE_SIZE })
    loadMore({ data, error }) {
        if (data) {
            this.contacts = [...this.contacts, ...data.records.records];
            this.nextPageToken = data.records.nextPageToken;
            this.done = !this.nextPageToken;
        } else if (error) {
            console.error('Error loading next page:', error);
        }
        this.isLoading = false;
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value.toLowerCase();
        if (this.searchKey === '') {
            this.noResults = false;
        } else {
            const filtered = this.contacts.filter(c =>
                c.fields.Name.value.toLowerCase().includes(this.searchKey)
            );
            this.noResults = filtered.length === 0;
            this.contacts = filtered;
        }
    }
}
