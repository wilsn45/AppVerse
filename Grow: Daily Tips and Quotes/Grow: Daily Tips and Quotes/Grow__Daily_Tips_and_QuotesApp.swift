//
//  Grow__Daily_Tips_and_QuotesApp.swift
//  Grow: Daily Tips and Quotes
//
//  Created by Wilson.Shakya on 13/10/24.
//

import SwiftUI

@main
struct Grow__Daily_Tips_and_QuotesApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
