//
//  GrowApp.swift
//  Grow
//
//  Created by Wilson.Shakya on 13/10/24.
//

import SwiftUI

@main
struct GrowApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
