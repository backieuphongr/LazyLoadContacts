public with sharing class LazyLoadContactsController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> fetchContacts(Integer offsetSize, Integer limitSize, String searchKey) {
        String key = (searchKey == null) ? '' : searchKey.trim();
        String searchPattern = '%' + key + '%';

        return [
            SELECT Id, Name, Email, Phone
            FROM Contact
            WHERE Name LIKE :searchPattern
            ORDER BY CreatedDate DESC
            LIMIT :limitSize OFFSET :offsetSize
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalCount(String searchKey) {
        String key = (searchKey == null) ? '' : searchKey.trim();
        String searchPattern = '%' + key + '%';
        return [SELECT COUNT() FROM Contact WHERE Name LIKE :searchPattern];
    }
}
