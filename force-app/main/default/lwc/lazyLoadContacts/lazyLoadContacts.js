import { LightningElement, track, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import NAME_FIELD from '@salesforce/schema/Contact.Name';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';

const PAGE_SIZE = 10;

export default class LazyLoadContactsLds extends LightningElement {
    @track contacts = [];
    @track isLoading = false;
    @track noResults = false;
    @track searchKey = '';

    nextPageToken;
    done = false;

    // initial wire to load records
    @wire(getListUi, {
        objectApiName: CONTACT_OBJECT,
        listViewApiName: 'AllContacts',
        pageSize: PAGE_SIZE
    })
    wiredList({ error, data }) {
        if (data) {
            this.contacts = data.records.records;
            this.nextPageToken = data.records.nextPageToken;
            this.done = !this.nextPageToken;
        } else if (error) {
            console.error(error);
        }
    }

    async loadMoreData() {
        if (this.done || this.isLoading) return;
        this.isLoading = true;

        try {
            const { records } = await getListUi({
                objectApiName: CONTACT_OBJECT,
                listViewApiName: 'AllContacts',
                pageToken: this.nextPageToken,
                pageSize: PAGE_SIZE
            });
            this.contacts = [...this.contacts, ...records.records];
            this.nextPageToken = records.nextPageToken;
            this.done = !this.nextPageToken;
        } catch (error) {
            console.error('Error loading more contacts:', error);
        } finally {
            this.isLoading = false;
        }
    }

    handleScroll(event) {
        const el = event.target;
        const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
        if (bottom && !this.isLoading) {
            this.loadMoreData();
        }
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.filterContacts();
    }

    filterContacts() {
        const allContacts = this.contacts;
        if (this.searchKey === '') {
            this.noResults = false;
            this.template.querySelector('div[onscroll]').scrollTop = 0;
            return;
        }
        const filtered = allContacts.filter(con =>
            con.fields.Name.value.toLowerCase().includes(this.searchKey)
        );
        this.noResults = filtered.length === 0;
        this.contacts = filtered;
    }
}
