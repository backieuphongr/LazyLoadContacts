import { LightningElement, track } from 'lwc';
import fetchContacts from '@salesforce/apex/LazyLoadContactsServerController.fetchContacts';
import getTotalCount from '@salesforce/apex/LazyLoadContactsServerController.getTotalCount';

const PAGE_SIZE = 10;

export default class LazyLoadContactsServer extends LightningElement {
    @track contacts = [];
    @track isLoading = false;
    @track noResults = false;
    @track searchKey = '';

    offset = 0;
    totalCount = 0;

    connectedCallback() {
        this.loadContacts();
    }

    async loadContacts(reset = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        if (reset) {
            this.offset = 0;
            this.contacts = [];
            this.totalCount = 0;
        }

        try {
            const results = await fetchContacts({
                searchKey: this.searchKey || '',
                offsetSize: this.offset,
                limitSize: PAGE_SIZE
            });

            if (reset) {
                this.contacts = results;
            } else {
                this.contacts = [...this.contacts, ...results];
            }

            this.noResults = this.contacts.length === 0;

            if (this.totalCount === 0) {
                this.totalCount = await getTotalCount({ searchKey: this.searchKey || '' });
            }

            this.offset += results.length;
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            this.isLoading = false;
        }
    }

    handleScroll(event) {
        const el = event.target;
        const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;

        if (bottom && !this.isLoading && this.contacts.length < this.totalCount) {
            this.loadContacts();
        }
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
        this.debouncedSearch();
    }

    // 🔹 Debounce to avoid calling Apex on every keystroke
    debouncedSearch = this.debounce(() => {
        this.loadContacts(true);
    }, 500);

    debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
}
