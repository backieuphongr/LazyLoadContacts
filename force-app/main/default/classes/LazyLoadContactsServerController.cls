public with sharing class LazyLoadContactsServerController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> fetchContacts(String searchKey, Integer offsetSize, Integer limitSize) {
        String key = '%' + searchKey + '%';

        return [
            SELECT Id, Name, Email, Phone
            FROM Contact
            WHERE Name LIKE :key
            ORDER BY Name
            LIMIT :limitSize OFFSET :offsetSize
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalCount(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT COUNT()
            FROM Contact
            WHERE Name LIKE :key
        ];
    }
}
